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
          <h2 className="text-base font-semibold text-text-primary mb-6">
            Top Companies Applied To
          </h2>
          <div className="flex gap-6 items-start">
            {/* Podium — top 3 */}
            <div className="flex items-end gap-2 shrink-0">
              {/* 2nd — silver */}
              {stats.top_companies[1] && (
                <div className="flex flex-col items-center w-24">
                  <CompanyLogoMock company={stats.top_companies[1]} domain={`${stats.top_companies[1].toLowerCase().replace(/\s+/g, '')}.com`} size="md" />
                  <span className="text-[11px] font-medium text-text-primary text-center mt-1.5 mb-2 leading-tight line-clamp-2 capitalize">{stats.top_companies[1]}</span>
                  <div className="w-full h-14 bg-zinc-100 border border-zinc-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-base font-bold text-zinc-400">2</span>
                  </div>
                </div>
              )}
              {/* 1st — gold */}
              <div className="flex flex-col items-center w-24">
                <CompanyLogoMock company={stats.top_companies[0]} domain={`${stats.top_companies[0].toLowerCase().replace(/\s+/g, '')}.com`} size="md" />
                <span className="text-[11px] font-medium text-text-primary text-center mt-1.5 mb-2 leading-tight line-clamp-2 capitalize">{stats.top_companies[0]}</span>
                <div className="w-full h-20 bg-amber-50 border border-amber-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-base font-bold text-amber-500">1</span>
                </div>
              </div>
              {/* 3rd — bronze */}
              {stats.top_companies[2] && (
                <div className="flex flex-col items-center w-24">
                  <CompanyLogoMock company={stats.top_companies[2]} domain={`${stats.top_companies[2].toLowerCase().replace(/\s+/g, '')}.com`} size="md" />
                  <span className="text-[11px] font-medium text-text-primary text-center mt-1.5 mb-2 leading-tight line-clamp-2 capitalize">{stats.top_companies[2]}</span>
                  <div className="w-full h-10 bg-orange-50 border border-orange-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-base font-bold text-orange-400">3</span>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-border self-stretch" />

            {/* 4–10 list */}
            <div className="flex-1 space-y-1.5 self-center">
              {stats.top_companies.slice(3).map((company, i) => (
                <div key={company} className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-lg">
                  <span className="text-xs font-mono text-text-muted w-4 shrink-0 text-right">{i + 4}</span>
                  <CompanyLogoMock company={company} domain={`${company.toLowerCase().replace(/\s+/g, '')}.com`} size="sm" />
                  <span className="text-sm font-medium text-text-primary capitalize">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
