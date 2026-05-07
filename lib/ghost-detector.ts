import { SupabaseClient } from '@supabase/supabase-js';
import { PipelineStage } from '@/types';

const GHOST_THRESHOLDS: Partial<Record<PipelineStage, number>> = {
  applied: 14,
  recruiter_outreach: 7,
  phone_screen: 7,
  interview_scheduled: 7,
  assessment: 10,
  final_round: 7,
};

const TERMINAL_STAGES: PipelineStage[] = ['offer', 'rejected', 'ghosted'];

export async function detectGhosts(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('id, stage, last_activity_at')
    .eq('user_id', userId)
    .not('stage', 'in', `(${TERMINAL_STAGES.join(',')})`);

  if (error || !applications) return 0;

  const now = Date.now();
  let ghostsDetected = 0;

  for (const app of applications) {
    const threshold = GHOST_THRESHOLDS[app.stage as PipelineStage];
    if (!threshold || !app.last_activity_at) continue;

    const lastActivity = new Date(app.last_activity_at).getTime();
    const daysSince = (now - lastActivity) / 86400000;

    if (daysSince > threshold) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          stage: 'ghosted',
          is_ghosted: true,
          ghosted_at: new Date().toISOString(),
        })
        .eq('id', app.id);

      if (!updateError) ghostsDetected++;
    }
  }

  return ghostsDetected;
}
