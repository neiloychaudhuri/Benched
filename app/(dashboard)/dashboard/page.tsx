'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Application, PipelineStage } from '@/types';
import { Ghost } from 'lucide-react';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { ListView } from '@/components/pipeline/ListView';
import { ViewToggle, ViewMode } from '@/components/pipeline/ViewToggle';
import { SyncButton } from '@/components/layout/SyncButton';
import { Onboarding } from '@/components/Onboarding';
import { FilterBar, Filters, DEFAULT_FILTERS } from '@/components/pipeline/FilterBar';
import { EditApplicationModal } from '@/components/pipeline/EditApplicationModal';

const TERMINAL_STAGES: PipelineStage[] = ['ghosted', 'rejected'];

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('kanban');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const onboardingDismissed = useRef(false);

  const fetchApplications = useCallback(async () => {
    const [appsRes, profileRes] = await Promise.all([
      fetch('/api/applications'),
      fetch('/api/profile'),
    ]);
    const profile = profileRes.ok ? await profileRes.json() : null;
    if (appsRes.ok) {
      const data = await appsRes.json();
      setApplications(data);
      if (data.length === 0 && !profile?.gmail_last_synced_at && !onboardingDismissed.current) {
        setShowOnboarding(true);
      }
    }
    setLastSyncedAt(profile?.gmail_last_synced_at ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (filters.search && !app.company_name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.stages.length > 0 && !filters.stages.includes(app.stage)) {
        return false;
      }
      if (filters.hideTerminal && TERMINAL_STAGES.includes(app.stage)) {
        return false;
      }
      if (filters.dateFrom && app.applied_at && app.applied_at < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && app.applied_at && app.applied_at > filters.dateTo + 'T23:59:59') {
        return false;
      }
      return true;
    });
  }, [applications, filters]);

  async function handleStageChange(id: string, stage: PipelineStage) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage } : a))
    );
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
  }

  async function handleDelete(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/applications/${id}`, { method: 'DELETE' });
  }

  function handleUpdate(updated: Application) {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  const ghostedCount = applications.filter((a) => a.is_ghosted).length;
  const isFiltered = filteredApplications.length !== applications.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface-muted rounded-lg w-48 animate-pulse" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-64 h-96 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          onboardingDismissed.current = true;
          setShowOnboarding(false);
          fetchApplications();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-text-primary">Your Pipeline</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <ViewToggle view={view} onChange={setView} />
          <SyncButton
            lastSyncedAt={lastSyncedAt}
            onSyncComplete={() => fetchApplications()}
          />
        </div>
      </div>

      {ghostedCount > 0 && (
        <div className="bg-ghost-light border border-ghost/20 rounded-xl px-4 py-3 text-sm text-ghost font-medium flex items-center gap-2">
          <Ghost className="h-4 w-4 flex-shrink-0" />
          {ghostedCount} {ghostedCount === 1 ? 'company has' : 'companies have'} ghosted you. Keep going.
        </div>
      )}

      {applications.length > 0 && (
        <FilterBar filters={filters} onChange={setFilters} />
      )}

      {isFiltered && (
        <p className="text-xs text-text-muted">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      )}

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <p className="text-text-secondary text-lg">No applications found yet.</p>
          <p className="text-text-muted text-sm">Sync your Gmail to get started.</p>
          <SyncButton lastSyncedAt={null} onSyncComplete={() => fetchApplications()} />
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          applications={filteredApplications}
          onStageChange={handleStageChange}
          onEdit={setEditingApp}
        />
      ) : (
        <ListView
          applications={filteredApplications}
          onStageChange={handleStageChange}
          onEdit={setEditingApp}
        />
      )}

      {editingApp && (
        <EditApplicationModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
