import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error.message}`);
  }

  if (session) {
    await supabase
      .from('profiles')
      .update({
        google_access_token: session.provider_token,
        google_refresh_token: session.provider_refresh_token,
      })
      .eq('id', session.user.id);

    // Trigger initial Gmail sync (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/sync`, {
      method: 'POST',
      headers: { Cookie: request.headers.get('cookie') || '' },
    }).catch(() => {});
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
