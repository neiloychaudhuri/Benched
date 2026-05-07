'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Application, PipelineStage, STAGE_ORDER, STAGE_LABELS } from '@/types';
import { KanbanColumn, COL_PREFIX } from './KanbanColumn';
import { ApplicationCard } from './ApplicationCard';

const STORAGE_KEY = 'benched:column-order';

function loadColumnOrder(): PipelineStage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: PipelineStage[] = JSON.parse(stored);
      const missing = STAGE_ORDER.filter((s) => !parsed.includes(s));
      return [...parsed, ...missing];
    }
  } catch {}
  return [...STAGE_ORDER];
}

type ActiveItem =
  | { type: 'card'; app: Application }
  | { type: 'column'; stage: PipelineStage }
  | null;

interface KanbanBoardProps {
  applications: Application[];
  onStageChange: (id: string, stage: PipelineStage) => void;
  onEdit?: (app: Application) => void;
}

export function KanbanBoard({ applications, onStageChange, onEdit }: KanbanBoardProps) {
  const [columnOrder, setColumnOrder] = useState<PipelineStage[]>(STAGE_ORDER);
  const [activeItem, setActiveItem] = useState<ActiveItem>(null);
  const savedOrder = useRef<PipelineStage[]>(STAGE_ORDER);
  const activeItemRef = useRef<ActiveItem>(null);

  useEffect(() => {
    const order = loadColumnOrder();
    setColumnOrder(order);
    savedOrder.current = order;
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStage = Object.fromEntries(
    columnOrder.map((s) => [s, applications.filter((a) => a.stage === s)])
  ) as Record<PipelineStage, Application[]>;

  const columnSortableIds = columnOrder.map((s) => `${COL_PREFIX}${s}`);

  // Separate collision detection for cards vs columns so they don't interfere
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const isColumnDrag = activeItemRef.current?.type === 'column';
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((c) =>
        isColumnDrag
          ? c.id.toString().startsWith(COL_PREFIX)
          : !c.id.toString().startsWith(COL_PREFIX)
      ),
    });
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === 'column') {
      const item: ActiveItem = { type: 'column', stage: active.data.current?.stage as PipelineStage };
      setActiveItem(item);
      activeItemRef.current = item;
      savedOrder.current = [...columnOrder];
    } else {
      const app = applications.find((a) => a.id === active.id);
      if (app) {
        const item: ActiveItem = { type: 'card', app };
        setActiveItem(item);
        activeItemRef.current = item;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'column') return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (!overId.startsWith(COL_PREFIX) || activeId === overId) return;

    const activeStage = activeId.replace(COL_PREFIX, '') as PipelineStage;
    const overStage = overId.replace(COL_PREFIX, '') as PipelineStage;

    const oldIdx = columnOrder.indexOf(activeStage);
    const newIdx = columnOrder.indexOf(overStage);

    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      setColumnOrder((prev) => arrayMove(prev, oldIdx, newIdx));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveItem(null);
    activeItemRef.current = null;

    if (active.data.current?.type === 'column') {
      if (!over) {
        setColumnOrder(savedOrder.current);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnOrder));
        savedOrder.current = [...columnOrder];
      }
      return;
    }

    if (!over) return;
    const draggedApp = applications.find((a) => a.id === active.id);
    if (!draggedApp) return;

    const overId = over.id.toString();
    let targetStage: PipelineStage | null = null;

    if (STAGE_ORDER.includes(overId as PipelineStage)) {
      targetStage = overId as PipelineStage;
    } else {
      const targetApp = applications.find((a) => a.id === overId);
      if (targetApp) targetStage = targetApp.stage;
    }

    if (targetStage && targetStage !== draggedApp.stage) {
      onStageChange(draggedApp.id, targetStage);
    }
  }

  function handleDragCancel() {
    const wasColumn = activeItemRef.current?.type === 'column';
    setActiveItem(null);
    activeItemRef.current = null;
    if (wasColumn) setColumnOrder(savedOrder.current);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={columnSortableIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-2 overflow-x-auto pb-4">
          {columnOrder.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={byStage[stage] ?? []}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeItem?.type === 'card' && (
          <div className="rotate-1 scale-105 shadow-xl">
            <ApplicationCard application={activeItem.app} />
          </div>
        )}
        {activeItem?.type === 'column' && (
          <div className="w-52 bg-surface border-2 border-zinc-300 rounded-xl shadow-2xl overflow-hidden opacity-90">
            <div className="px-3 py-2.5 border-b border-border bg-zinc-50">
              <span className="text-sm font-semibold text-zinc-600">
                {STAGE_LABELS[activeItem.stage]}
              </span>
            </div>
            <div className="p-2 flex flex-col gap-2">
              {(byStage[activeItem.stage] ?? []).slice(0, 3).map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
