'use client';

import { useState } from 'react';
import { Application, PipelineStage, STAGE_LABELS, STAGE_ORDER } from '@/types';
import { formatRelativeTime, formatCompanyName } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { Trash2, ChevronUp, ChevronDown, Ghost } from 'lucide-react';

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

type SortKey = 'company_name' | 'stage' | 'last_activity_at' | 'applied_at';

interface ListViewProps {
  applications: Application[];
  onStageChange: (id: string, stage: PipelineStage) => void;
  onDelete: (id: string) => void;
}

export function ListView({ applications, onStageChange, onDelete }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('last_activity_at');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = [...applications].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (sortKey === 'stage') {
      aVal = STAGE_ORDER.indexOf(a.stage);
      bVal = STAGE_ORDER.indexOf(b.stage);
    } else if (sortKey === 'company_name') {
      aVal = a.company_name.toLowerCase();
      bVal = b.company_name.toLowerCase();
    } else {
      aVal = a[sortKey] ?? '';
      bVal = b[sortKey] ?? '';
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortAsc ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  }

  function HeaderCell({
    col,
    label,
  }: {
    col: SortKey;
    label: string;
  }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary select-none"
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          <SortIcon col={col} />
        </span>
      </th>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted border-b border-border">
          <tr>
            <HeaderCell col="company_name" label="Company" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Role
            </th>
            <HeaderCell col="stage" label="Stage" />
            <HeaderCell col="last_activity_at" label="Last Activity" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((app) => (
            <tr
              key={app.id}
              className={`hover:bg-surface-muted transition-colors ${
                app.is_ghosted ? 'bg-ghost-light/40' : ''
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <CompanyLogo name={app.company_name} size="sm" />
                  <span className="font-medium text-text-primary">
                    {formatCompanyName(app.company_name)}
                    {app.is_ghosted && <Ghost className="h-3.5 w-3.5 inline-block ml-1 text-ghost" />}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {app.role_title ?? <span className="text-text-muted italic">—</span>}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    STAGE_BADGE_STYLES[app.stage]
                  }`}
                >
                  {STAGE_LABELS[app.stage]}
                </span>
              </td>
              <td className="px-4 py-3 text-text-secondary text-xs">
                {formatRelativeTime(app.last_activity_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <select
                    value={app.stage}
                    onChange={(e) =>
                      onStageChange(app.id, e.target.value as PipelineStage)
                    }
                    className="text-xs border border-border rounded-lg px-2 py-1 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    {STAGE_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onDelete(app.id)}
                    className="p-1 text-text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          No applications to show.
        </div>
      )}
    </div>
  );
}
