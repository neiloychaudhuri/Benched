import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Application, PipelineStage, RecruitingStats, STAGE_ORDER } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch', code: 'DB_ERROR' }, { status: 500 });
  }

  const apps = (applications || []) as Application[];
  const stats = computeStats(apps);

  return NextResponse.json(stats);
}

function computeStats(apps: Application[]): RecruitingStats {
  const total = apps.length;

  const stageBreakdown = Object.fromEntries(
    STAGE_ORDER.map((s) => [s, 0])
  ) as Record<PipelineStage, number>;

  for (const app of apps) {
    stageBreakdown[app.stage] = (stageBreakdown[app.stage] ?? 0) + 1;
  }

  const RESPONDED_STAGES: PipelineStage[] = [
    'recruiter_outreach',
    'phone_screen',
    'interview_scheduled',
    'assessment',
    'final_round',
    'offer',
    'rejected',
  ];

  const INTERVIEW_STAGES: PipelineStage[] = [
    'phone_screen',
    'interview_scheduled',
    'assessment',
    'final_round',
    'offer',
  ];

  const responded = apps.filter((a) =>
    RESPONDED_STAGES.includes(a.stage)
  ).length;
  const interviewed = apps.filter((a) =>
    INTERVIEW_STAGES.includes(a.stage)
  ).length;
  const offers = stageBreakdown['offer'];
  const ghosted = apps.filter((a) => a.is_ghosted).length;

  const TERMINAL: PipelineStage[] = ['offer', 'rejected', 'ghosted'];
  const active = apps.filter((a) => !TERMINAL.includes(a.stage)).length;

  // Avg days to response: for apps that got a response, measure applied_at → last_activity_at
  const responseTimes = apps
    .filter(
      (a) =>
        RESPONDED_STAGES.includes(a.stage) &&
        a.applied_at &&
        a.last_activity_at
    )
    .map((a) => {
      const diff =
        new Date(a.last_activity_at!).getTime() -
        new Date(a.applied_at!).getTime();
      return diff / 86400000;
    });

  const avgDaysToResponse =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : null;

  // Top companies by application count (trivially 1 each, but keeps API shape correct)
  const companyCounts = new Map<string, number>();
  for (const app of apps) {
    companyCounts.set(app.company_name, (companyCounts.get(app.company_name) ?? 0) + 1);
  }
  const topCompanies = [...companyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  return {
    total_applications: total,
    response_rate: total > 0 ? Math.round((responded / total) * 100) : 0,
    interview_rate: total > 0 ? Math.round((interviewed / total) * 100) : 0,
    offer_rate: total > 0 ? Math.round((offers / total) * 100) : 0,
    ghosted_count: ghosted,
    active_count: active,
    avg_days_to_response: avgDaysToResponse !== null ? Math.round(avgDaysToResponse) : null,
    stage_breakdown: stageBreakdown,
    top_companies: topCompanies,
  };
}
