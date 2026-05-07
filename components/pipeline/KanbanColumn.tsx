'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application, PipelineStage, STAGE_LABELS } from '@/types';
import { ApplicationCard } from './ApplicationCard';
import { GripVertical, Ghost, PartyPopper } from 'lucide-react';

export const COL_PREFIX = 'col::';

function SortableCard({ application, onEdit }: { application: Application; onEdit?: (app: Application) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id, data: { type: 'card' } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <ApplicationCard application={application} onEdit={onEdit} />
    </div>
  );
}

interface KanbanColumnProps {
  stage: PipelineStage;
  applications: Application[];
  onEdit?: (app: Application) => void;
}

const COLUMN_ACCENTS: Partial<Record<PipelineStage, string>> = {};

export function KanbanColumn({ stage, applications, onEdit }: KanbanColumnProps) {
  // Sortable for the column itself (drag handle)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
    isOver: isSortableOver,
  } = useSortable({
    id: `${COL_PREFIX}${stage}`,
    data: { type: 'column', stage },
  });

  // Droppable for cards being dropped into this column
  const { setNodeRef: setDropRef, isOver: isCardOver } = useDroppable({ id: stage });

  const isGhostedCol = stage === 'ghosted';
  const isOfferCol = stage === 'offer';

  return (
    <div
      ref={setSortableRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex-shrink-0 w-52 flex flex-col rounded-xl border border-border bg-surface-muted ${
        isCardOver ? 'bg-zinc-100/60' : ''
      } ${isDragging ? 'opacity-30 scale-95' : ''} ${isGhostedCol ? 'opacity-70' : ''}`}
    >
      {/* Column header — drag handle lives here */}
      <div className="px-2.5 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing p-0.5 rounded touch-none"
            title="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-semibold text-text-primary select-none flex items-center gap-1">
            {isGhostedCol && <Ghost className="h-3.5 w-3.5 text-ghost" />}
            {isOfferCol && <PartyPopper className="h-3.5 w-3.5 text-success" />}
            {STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="text-xs font-medium bg-border text-text-secondary px-1.5 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      {/* Card drop zone */}
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setDropRef}
          className="flex-1 p-1.5 flex flex-col gap-1.5 min-h-20 overflow-y-auto max-h-[calc(100vh-210px)]"
        >
          {applications.map((app) => (
            <SortableCard key={app.id} application={app} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
