'use client';

import { RecruitingStats } from '@/types';
import { TrendingUp, Mic, Gift, Ghost, Activity, Clock } from 'lucide-react';

interface StatsGridProps {
  stats: RecruitingStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      label: 'Total Applications',
      value: stats.total_applications,
      suffix: '',
      icon: TrendingUp,
      color: 'text-zinc-600',
      bg: 'bg-zinc-100',
    },
    {
      label: 'Response Rate',
      value: stats.response_rate,
      suffix: '%',
      icon: Activity,
      color: 'text-violet-600',
      bg: 'bg-violet-100',
    },
    {
      label: 'Interview Rate',
      value: stats.interview_rate,
      suffix: '%',
      icon: Mic,
      color: 'text-sky-600',
      bg: 'bg-sky-100',
    },
    {
      label: 'Offer Rate',
      value: stats.offer_rate,
      suffix: '%',
      icon: Gift,
      color: 'text-success',
      bg: 'bg-success-light',
    },
    {
      label: 'Ghosted',
      value: stats.ghosted_count,
      suffix: '',
      icon: Ghost,
      color: 'text-ghost',
      bg: 'bg-ghost-light',
    },
    {
      label: 'Avg. Days to Response',
      value: stats.avg_days_to_response ?? '—',
      suffix: stats.avg_days_to_response !== null ? 'd' : '',
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning-light',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-secondary font-medium">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              {card.value}
              {card.suffix}
            </p>
          </div>
        );
      })}
    </div>
  );
}
