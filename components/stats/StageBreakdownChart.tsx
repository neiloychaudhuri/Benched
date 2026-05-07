'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PipelineStage, STAGE_LABELS, STAGE_ORDER } from '@/types';

const STAGE_COLORS: Record<PipelineStage, string> = {
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

interface StageBreakdownChartProps {
  stageBreakdown: Record<PipelineStage, number>;
}

export function StageBreakdownChart({ stageBreakdown }: StageBreakdownChartProps) {
  const data = STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: stageBreakdown[stage] ?? 0,
  })).filter((d) => d.count > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12 }}
          width={140}
        />
        <Tooltip
          formatter={(value) => [value, 'Applications']}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #E4E4E7',
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
