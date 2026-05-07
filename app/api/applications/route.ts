import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('last_activity_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch', code: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json();
  const { company_name, role_title, stage, applied_at } = body;

  if (!company_name) {
    return NextResponse.json(
      { error: 'company_name is required', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      company_name,
      role_title: role_title ?? null,
      stage: stage ?? 'applied',
      applied_at: applied_at ?? new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create', code: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
