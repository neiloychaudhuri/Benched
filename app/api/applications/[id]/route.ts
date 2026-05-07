import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { stage, notes } = body;

  const updates: Record<string, unknown> = {};
  if (stage !== undefined) {
    updates.stage = stage;
    updates.last_activity_at = new Date().toISOString();
    if (stage === 'ghosted') {
      updates.is_ghosted = true;
      updates.ghosted_at = new Date().toISOString();
    } else {
      updates.is_ghosted = false;
      updates.ghosted_at = null;
    }
  }
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update', code: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete', code: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
