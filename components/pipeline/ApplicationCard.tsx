'use client';

import { Application, PipelineStage, STAGE_LABELS } from '@/types';
import { formatRelativeTime, formatCompanyName } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { Ghost, Pencil } from 'lucide-react';

const STAGE_BADGE_STYLES: Record<PipelineStage, string> = {
  applied: 'bg-zinc-100 text-zinc-600',
  recruiter_outreach: 'bg-stone-100 text-stone-600',
  phone_screen: 'bg-zinc-100 text-zinc-600',
  interview_scheduled: 'bg-neutral-200 text-neutral-700',
  assessment: 'bg-zinc-200 text-zinc-700',
  final_round: 'bg-stone-200 text-stone-700',
  offer: 'bg-success-light text-success',
  rejected: 'bg-danger-light text-danger',
  ghosted: 'bg-ghost-light text-ghost',
};

interface ApplicationCardProps {
  application: Application;
  onEdit?: (app: Application) => void;
}

export function ApplicationCard({ application, onEdit }: ApplicationCardProps) {
  const isGhosted = application.is_ghosted;
  const displayName = formatCompanyName(application.company_name);

  return (
    <div
      className={`group bg-surface border border-border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing select-none ${
        isGhosted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <CompanyLogo name={application.company_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs text-text-primary truncate leading-tight">
            {displayName}
            {isGhosted && <Ghost className="h-3 w-3 inline-block ml-1 text-ghost" />}
          </p>
          {application.role_title && (
            <p className="text-xs text-text-muted truncate leading-tight mt-0.5">
              {application.role_title}
            </p>
          )}
        </div>
        {onEdit && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(application); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-surface-muted text-text-muted hover:text-text-secondary transition-all shrink-0"
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center flex-wrap gap-x-2 gap-y-1">
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
            STAGE_BADGE_STYLES[application.stage]
          }`}
        >
          {STAGE_LABELS[application.stage]}
        </span>
        <span className="text-xs text-text-muted whitespace-nowrap">
          {isGhosted
            ? formatRelativeTime(application.ghosted_at)
            : formatRelativeTime(application.last_activity_at)}
        </span>
      </div>
    </div>
  );
}
