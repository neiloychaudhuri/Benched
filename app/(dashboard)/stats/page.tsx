'use client';

import { useEffect, useState } from 'react';
import { RecruitingStats, Application } from '@/types';
import { CompanyLogoMock } from '@/components/ui/CompanyLogoMock';
import { StatsGrid } from '@/components/stats/StatsGrid';
import { StageBreakdownChart } from '@/components/stats/StageBreakdownChart';
import { ActivityTimeline } from '@/components/stats/ActivityTimeline';

export default function StatsPage() {
  const [stats, setStats] = useState<RecruitingStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/applications').then((r) => r.json()),
    ]).then(([statsData, appsData]) => {
      setStats(statsData);
      setApplications(appsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-surface-muted rounded-lg w-36 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-text-primary">Your Stats</h1>

      {stats && <StatsGrid stats={stats} />}

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Applications by Stage
        </h2>
        {stats && <StageBreakdownChart stageBreakdown={stats.stage_breakdown} />}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Application Volume (last 12 weeks)
        </h2>
        <ActivityTimeline applications={applications} />
      </div>

      {stats && stats.top_companies.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Top Companies Applied To
          </h2>
          <div className="space-y-2">
            {stats.top_companies.map((company, i) => (
              <div key={company} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                <span className="text-xs font-mono text-text-muted w-5 shrink-0 text-right">{i + 1}</span>
                <CompanyLogoMock company={company} domain={`${company.toLowerCase().replace(/\s+/g, '')}.com`} size="sm" />
                <span className="text-sm font-medium text-text-primary capitalize">{company}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
