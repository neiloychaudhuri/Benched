'use client';

import { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { PipelineStage, STAGE_LABELS, STAGE_ORDER } from '@/types';

export interface Filters {
  search: string;
  stages: PipelineStage[];
  hideTerminal: boolean;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  stages: [],
  hideTerminal: false,
  dateFrom: '',
  dateTo: '',
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const TERMINAL_STAGES: PipelineStage[] = ['ghosted', 'rejected'];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [stageOpen, setStageOpen] = useState(false);

  const activeCount = [
    filters.search,
    filters.stages.length > 0,
    filters.hideTerminal,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  function toggleStage(stage: PipelineStage) {
    const next = filters.stages.includes(stage)
      ? filters.stages.filter((s) => s !== stage)
      : [...filters.stages, stage];
    onChange({ ...filters, stages: next });
  }

  function reset() {
    onChange(DEFAULT_FILTERS);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search company…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-zinc-400 w-44"
        />
      </div>

      {/* Stage filter */}
      <div className="relative">
        <button
          onClick={() => setStageOpen(!stageOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
            filters.stages.length > 0
              ? 'border-zinc-400 bg-zinc-100 text-zinc-700'
              : 'border-border bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          Stages
          {filters.stages.length > 0 && (
            <span className="bg-zinc-700 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {filters.stages.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {stageOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setStageOpen(false)} />
            <div className="absolute top-full mt-1 left-0 z-20 bg-surface border border-border rounded-xl shadow-lg p-2 min-w-48">
              {STAGE_ORDER.map((stage) => (
                <label
                  key={stage}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.stages.includes(stage)}
                    onChange={() => toggleStage(stage)}
                    className="accent-zinc-600"
                  />
                  <span className="text-sm text-text-primary">{STAGE_LABELS[stage]}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hide terminal toggle */}
      <button
        onClick={() => onChange({ ...filters, hideTerminal: !filters.hideTerminal })}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
          filters.hideTerminal
            ? 'border-zinc-400 bg-zinc-100 text-zinc-700'
            : 'border-border bg-surface text-text-secondary hover:text-text-primary'
        }`}
      >
        Hide {TERMINAL_STAGES.map((s) => STAGE_LABELS[s]).join(' & ')}
      </button>

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="px-2 py-1.5 text-xs border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-400"
          title="Applied after"
        />
        <span className="text-text-muted text-xs">–</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="px-2 py-1.5 text-xs border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-400"
          title="Applied before"
        />
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={reset}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-text-muted hover:text-danger transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
