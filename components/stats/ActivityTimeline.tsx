'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Application } from '@/types';
import { format, startOfWeek, subWeeks, addWeeks } from 'date-fns';

interface ActivityTimelineProps {
  applications: Application[];
}

export function ActivityTimeline({ applications }: ActivityTimelineProps) {
  const now = new Date();
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 11 - i));
    return {
      weekStart,
      label: format(weekStart, 'MMM d'),
      count: 0,
    };
  });

  for (const app of applications) {
    if (!app.applied_at) continue;
    const appliedAt = new Date(app.applied_at);
    for (const week of weeks) {
      const weekEnd = addWeeks(week.weekStart, 1);
      if (appliedAt >= week.weekStart && appliedAt < weekEnd) {
        week.count++;
        break;
      }
    }
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={weeks} margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
        <Tooltip
          formatter={(value) => [value, 'Applications']}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #E4E4E7',
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#71717a"
          strokeWidth={2}
          dot={{ r: 3, fill: '#71717a' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
