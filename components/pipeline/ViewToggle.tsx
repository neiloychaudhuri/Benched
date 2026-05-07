'use client';

import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'kanban' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-surface-muted border border-border rounded-lg p-0.5">
      {(['kanban', 'list'] as ViewMode[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === v
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {v === 'kanban' ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <List className="h-4 w-4" />
          )}
          {v === 'kanban' ? 'Kanban' : 'List'}
        </button>
      ))}
    </div>
  );
}
