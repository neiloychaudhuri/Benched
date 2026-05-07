export type PipelineStage =
  | 'applied'
  | 'recruiter_outreach'
  | 'phone_screen'
  | 'interview_scheduled'
  | 'assessment'
  | 'final_round'
  | 'offer'
  | 'rejected'
  | 'ghosted';

export const STAGE_LABELS: Record<PipelineStage, string> = {
  applied: 'Applied',
  recruiter_outreach: 'Recruiter Outreach',
  phone_screen: 'Phone Screen',
  interview_scheduled: 'Interview Scheduled',
  assessment: 'Assessment',
  final_round: 'Final Round',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
};

export const STAGE_ORDER: PipelineStage[] = [
  'applied',
  'recruiter_outreach',
  'phone_screen',
  'interview_scheduled',
  'assessment',
  'final_round',
  'offer',
  'rejected',
  'ghosted',
];

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string | null;
  stage: PipelineStage;
  is_ghosted: boolean;
  ghosted_at: string | null;
  last_activity_at: string | null;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  original_company_name?: string | null;
  original_role_title?: string | null;
  original_stage?: PipelineStage | null;
}

export interface Email {
  id: string;
  user_id: string;
  application_id: string | null;
  gmail_message_id: string;
  gmail_thread_id: string | null;
  subject: string | null;
  from_email: string | null;
  from_name: string | null;
  received_at: string | null;
  snippet: string | null;
  classified_stage: PipelineStage | null;
  classification_confidence: number | null;
}

export interface ClassificationResult {
  is_recruiting_related: boolean;
  company_name: string | null;
  role_title: string | null;
  stage: PipelineStage | null;
  confidence: number;
  reasoning: string;
}

export interface RecruitingStats {
  total_applications: number;
  response_rate: number;
  interview_rate: number;
  offer_rate: number;
  ghosted_count: number;
  active_count: number;
  avg_days_to_response: number | null;
  stage_breakdown: Record<PipelineStage, number>;
  top_companies: string[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  gmail_last_synced_at: string | null;
}

export interface SyncSummary {
  emails_scanned: number;
  emails_classified: number;
  new_applications: number;
  stage_updates: number;
  ghosts_detected: number;
}

export interface ParsedEmail {
  gmail_message_id: string;
  gmail_thread_id: string;
  subject: string;
  from_email: string;
  from_name: string;
  received_at: Date;
  snippet: string;
}
