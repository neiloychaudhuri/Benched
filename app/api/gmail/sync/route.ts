import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchEmails } from '@/lib/gmail/fetch';
import { classifyEmails } from '@/lib/gemini/classify';
import { detectGhosts } from '@/lib/ghost-detector';
import { normalizeCompanyName, isMoreAdvancedStage } from '@/lib/utils';
import { PipelineStage, SyncSummary } from '@/types';

async function refreshGoogleToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const summary: SyncSummary = {
    emails_scanned: 0,
    emails_classified: 0,
    new_applications: 0,
    stage_updates: 0,
    ghosts_detected: 0,
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token, gmail_last_synced_at')
      .eq('id', user.id)
      .single();

    console.log('[sync] token present:', !!profile?.google_access_token, '| last synced:', profile?.gmail_last_synced_at);

    if (!profile?.google_access_token) {
      return NextResponse.json({ error: 'No Gmail token', code: 'NO_TOKEN' }, { status: 400 });
    }

    let accessToken = profile.google_access_token;

    // Fetch emails — if 401, try refresh
    let emails;
    try {
      emails = await fetchEmails(
        accessToken,
        profile.gmail_last_synced_at ? new Date(profile.gmail_last_synced_at) : null
      );
    } catch (err: unknown) {
      const isAuthError =
        err instanceof Error && err.message.toLowerCase().includes('401');
      if (isAuthError && profile.google_refresh_token) {
        const newToken = await refreshGoogleToken(profile.google_refresh_token);
        if (!newToken) {
          return NextResponse.json(
            { error: 'Token refresh failed', code: 'TOKEN_REFRESH_FAILED' },
            { status: 401 }
          );
        }
        accessToken = newToken;
        await supabase
          .from('profiles')
          .update({ google_access_token: newToken })
          .eq('id', user.id);

        emails = await fetchEmails(
          accessToken,
          profile.gmail_last_synced_at ? new Date(profile.gmail_last_synced_at) : null
        );
      } else {
        throw err;
      }
    }

    summary.emails_scanned = emails.length;
    console.log('[sync] emails fetched from Gmail:', emails.length);

    if (emails.length === 0) {
      await supabase
        .from('profiles')
        .update({ gmail_last_synced_at: new Date().toISOString() })
        .eq('id', user.id);

      await supabase.from('sync_logs').insert({
        user_id: user.id,
        ...summary,
        status: 'success',
      });

      return NextResponse.json(summary);
    }

    // Classify in batches
    const classifications = await classifyEmails(emails);

    // Group by company and upsert applications
    const applicationMap = new Map<
      string,
      { stage: PipelineStage; appliedAt: Date; lastActivityAt: Date }
    >();

    const emailRows = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const classification = classifications[i];

      if (!classification?.is_recruiting_related || !classification.company_name) {
        continue;
      }

      summary.emails_classified++;

      const normalizedCompany = normalizeCompanyName(classification.company_name);
      const emailStage = classification.stage as PipelineStage | null;

      const existing = applicationMap.get(normalizedCompany);
      if (!existing) {
        applicationMap.set(normalizedCompany, {
          stage: emailStage ?? 'applied',
          appliedAt: email.received_at,
          lastActivityAt: email.received_at,
        });
      } else {
        if (
          emailStage &&
          (emailStage === 'offer' ||
            emailStage === 'rejected' ||
            isMoreAdvancedStage(existing.stage, emailStage))
        ) {
          existing.stage = emailStage;
        }
        if (email.received_at > existing.lastActivityAt) {
          existing.lastActivityAt = email.received_at;
        }
        if (email.received_at < existing.appliedAt) {
          existing.appliedAt = email.received_at;
        }
      }

      emailRows.push({
        user_id: user.id,
        gmail_message_id: email.gmail_message_id,
        gmail_thread_id: email.gmail_thread_id,
        subject: email.subject,
        from_email: email.from_email,
        from_name: email.from_name,
        received_at: email.received_at.toISOString(),
        snippet: email.snippet,
        classified_stage: emailStage,
        classification_confidence: classification.confidence,
        raw_classification: classification,
      });
    }

    // Insert emails (skip duplicates)
    if (emailRows.length > 0) {
      await supabase.from('emails').upsert(emailRows, {
        onConflict: 'gmail_message_id',
        ignoreDuplicates: true,
      });
    }

    // Fetch existing applications for this user
    const { data: existingApps } = await supabase
      .from('applications')
      .select('id, company_name, stage')
      .eq('user_id', user.id);

    const existingMap = new Map(
      (existingApps || []).map((a) => [normalizeCompanyName(a.company_name), a])
    );

    for (const [normalizedCompany, info] of applicationMap.entries()) {
      const existing = existingMap.get(normalizedCompany);

      if (!existing) {
        await supabase.from('applications').insert({
          user_id: user.id,
          company_name:
            [...applicationMap.keys()].find(
              (k) => normalizeCompanyName(k) === normalizedCompany
            ) ?? normalizedCompany,
          stage: info.stage,
          applied_at: info.appliedAt.toISOString(),
          last_activity_at: info.lastActivityAt.toISOString(),
        });
        summary.new_applications++;
      } else {
        const shouldUpdate =
          info.stage === 'offer' ||
          info.stage === 'rejected' ||
          isMoreAdvancedStage(existing.stage as PipelineStage, info.stage);

        await supabase
          .from('applications')
          .update({
            ...(shouldUpdate ? { stage: info.stage } : {}),
            last_activity_at: info.lastActivityAt.toISOString(),
          })
          .eq('id', existing.id);

        if (shouldUpdate) summary.stage_updates++;
      }
    }

    // Update email application_id links
    const { data: allApps } = await supabase
      .from('applications')
      .select('id, company_name')
      .eq('user_id', user.id);

    if (allApps && emailRows.length > 0) {
      const appByCompany = new Map(
        allApps.map((a) => [normalizeCompanyName(a.company_name), a.id])
      );

      for (let i = 0; i < emails.length; i++) {
        const classification = classifications[i];
        if (!classification?.company_name) continue;
        const appId = appByCompany.get(normalizeCompanyName(classification.company_name));
        if (!appId) continue;

        await supabase
          .from('emails')
          .update({ application_id: appId })
          .eq('gmail_message_id', emails[i].gmail_message_id)
          .eq('user_id', user.id);
      }
    }

    // Ghost detection
    summary.ghosts_detected = await detectGhosts(supabase, user.id);

    // Update last synced
    await supabase
      .from('profiles')
      .update({ gmail_last_synced_at: new Date().toISOString() })
      .eq('id', user.id);

    // Log sync
    await supabase.from('sync_logs').insert({
      user_id: user.id,
      ...summary,
      status: 'success',
    });

    return NextResponse.json(summary);
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json(
      { error: 'Sync failed', code: 'SYNC_ERROR' },
      { status: 500 }
    );
  }
}
