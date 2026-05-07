import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, gmail_last_synced_at')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json(profile);
}
