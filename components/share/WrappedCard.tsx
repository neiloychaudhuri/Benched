'use client';

import { forwardRef } from 'react';
import { RecruitingStats, STAGE_ORDER, STAGE_LABELS, PipelineStage } from '@/types';

interface WrappedCardProps {
  stats: RecruitingStats;
  season: string;
  accentColor: string;
}

const STAGE_MINI_COLORS: Record<PipelineStage, string> = {
  applied: '#71717a',
  recruiter_outreach: '#a1a1aa',
  phone_screen: '#d4d4d8',
  interview_scheduled: '#e4e4e7',
  assessment: '#52525b',
  final_round: '#3f3f46',
  offer: '#16A34A',
  rejected: '#DC2626',
  ghosted: '#9CA3AF',
};

export const WrappedCard = forwardRef<HTMLDivElement, WrappedCardProps>(
  ({ stats, season, accentColor }, ref) => {
    const totalNonZero = STAGE_ORDER.reduce(
      (sum, s) => sum + (stats.stage_breakdown[s] ?? 0),
      0
    );

    return (
      <div
        ref={ref}
        style={{ width: 600, height: 315, fontFamily: 'Geist, system-ui, sans-serif' }}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #f4f4f518 0%, #ffffff 60%, #f4f4f510 100%)`,
          }}
        />
        <div
          className="absolute inset-0 border-2 rounded-2xl"
          style={{ borderColor: `#e4e4e7` }}
        />

        <div className="relative h-full p-8 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: '#71717a' }}
              >
                Benched Wrapped
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{season}</h2>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: '#3f3f46' }}
            >
              Recruiting Season
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Applied', value: stats.total_applications },
              { label: 'Response Rate', value: `${stats.response_rate}%` },
              { label: 'Interviews', value: stats.interview_rate + '%' },
              { label: 'Offers', value: stats.offer_rate + '%' },
              { label: 'Ghosted', value: stats.ghosted_count },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-center"
              >
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Stage mini bar */}
          {totalNonZero > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Pipeline breakdown</p>
              <div className="flex h-3 rounded-full overflow-hidden gap-px">
                {STAGE_ORDER.map((s) => {
                  const count = stats.stage_breakdown[s] ?? 0;
                  if (count === 0) return null;
                  const pct = (count / totalNonZero) * 100;
                  return (
                    <div
                      key={s}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STAGE_MINI_COLORS[s],
                      }}
                      title={`${STAGE_LABELS[s]}: ${count}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">getbenched.co</p>
            <p className="text-xs font-bold text-gray-900">Benched</p>
          </div>
        </div>
      </div>
    );
  }
);
WrappedCard.displayName = 'WrappedCard';
