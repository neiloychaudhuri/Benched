'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  useDroppable,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CompanyLogoMock } from './CompanyLogoMock';
import { RotateCcw, Pencil, X, GripVertical } from 'lucide-react';

const COL_PFX = 'col::';

interface MockCard {
  id: string;
  company: string;
  domain: string;
  role: string;
  time: string;
}

interface MockColumn {
  stage: string;
  badge: string;
  cards: MockCard[];
}

type ActiveItem =
  | { type: 'card'; card: MockCard }
  | { type: 'column'; col: MockColumn }
  | null;

const STAGES = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Ghosted'];

const INITIAL_COLUMNS: MockColumn[] = [
  {
    stage: 'Applied',
    badge: 'bg-zinc-100 text-zinc-600',
    cards: [
      { id: 'google', company: 'Google', domain: 'google.com', role: 'Software Engineer', time: '2d' },
      { id: 'stripe', company: 'Stripe', domain: 'stripe.com', role: 'Backend Engineer', time: '4d' },
      { id: 'figma', company: 'Figma', domain: 'figma.com', role: 'Product Designer', time: '1w' },
    ],
  },
  {
    stage: 'Phone Screen',
    badge: 'bg-zinc-100 text-zinc-600',
    cards: [
      { id: 'linear', company: 'Linear', domain: 'linear.app', role: 'Full Stack Eng', time: '3d' },
      { id: 'vercel', company: 'Vercel', domain: 'vercel.com', role: 'DX Engineer', time: '5d' },
      { id: 'polarity', company: 'Polarity', domain: 'polarity.so', role: 'Software Engineer', time: '6d' },
    ],
  },
  {
    stage: 'Interview',
    badge: 'bg-neutral-200 text-neutral-700',
    cards: [
      { id: 'anthropic', company: 'Anthropic', domain: 'anthropic.com', role: 'Software Engineer', time: '1d' },
      { id: 'notion', company: 'Notion', domain: 'notion.so', role: 'Frontend Engineer', time: '3d' },
      { id: 'openai', company: 'OpenAI', domain: 'openai.com', role: 'Product Engineer', time: '5d' },
    ],
  },
  {
    stage: 'Offer',
    badge: 'bg-success-light text-success',
    cards: [
      { id: 'coinbase', company: 'Coinbase', domain: 'coinbase.com', role: 'iOS Engineer', time: 'Today' },
      { id: 'adobe', company: 'Adobe', domain: 'adobe.com', role: 'Software Engineer', time: '2d' },
    ],
  },
  {
    stage: 'Ghosted',
    badge: 'bg-ghost-light text-ghost',
    cards: [
      { id: 'meta', company: 'Meta', domain: 'meta.com', role: 'Product Manager', time: '14d' },
      { id: 'shopify', company: 'Shopify', domain: 'shopify.com', role: 'Backend Eng', time: '3w' },
      { id: 'pinterest', company: 'Pinterest', domain: 'pinterest.com', role: 'iOS Engineer', time: '3w' },
    ],
  },
];

function deepClone(cols: MockColumn[]): MockColumn[] {
  return cols.map((c) => ({ ...c, cards: c.cards.map((card) => ({ ...card })) }));
}

function SortableCard({ card, onEdit }: { card: MockCard; onEdit: (card: MockCard) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="group bg-surface rounded-lg mb-1.5 border border-border p-2.5 flex items-center gap-2 select-none"
    >
      <div {...attributes} {...listeners} className="flex items-center gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing">
        <CompanyLogoMock company={card.company} domain={card.domain} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-text-primary truncate leading-tight">{card.company}</p>
          <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">{card.role}</p>
        </div>
        <span className="text-[9px] text-text-muted shrink-0">{card.time}</span>
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onEdit(card); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface-muted text-text-muted hover:text-text-secondary transition-all shrink-0"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

function SortableColumn({ col, onEdit }: { col: MockColumn; onEdit: (card: MockCard) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${COL_PFX}${col.stage}`, data: { type: 'column' } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: col.stage });

  return (
    <div
      ref={setSortableRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-surface-muted rounded-xl p-3 min-w-0 transition-colors ${isOver ? 'bg-zinc-200/60' : ''} ${isDragging ? 'opacity-30 scale-95' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing p-0.5 rounded touch-none"
          >
            <GripVertical className="h-3 w-3" />
          </button>
          <span className="text-xs font-semibold text-text-secondary select-none">{col.stage}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${col.badge}`}>
          {col.cards.length}
        </span>
      </div>
      <SortableContext items={col.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setDropRef} className="min-h-8">
          {col.cards.map((card) => (
            <SortableCard key={card.id} card={card} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface ClearbitSuggestion { name: string; domain: string; }

function EditModal({
  card, currentStage, onSave, onClose,
}: {
  card: MockCard; currentStage: string;
  onSave: (updated: MockCard, newStage: string) => void;
  onClose: () => void;
}) {
  const [company, setCompany] = useState(card.company);
  const [domain, setDomain] = useState(card.domain);
  const [role, setRole] = useState(card.role);
  const [stage, setStage] = useState(currentStage);
  const [suggestions, setSuggestions] = useState<ClearbitSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const comboRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (company.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(company)}`);
        if (res.ok) setSuggestions(await res.json());
      } catch { setSuggestions([]); }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [company]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base text-text-primary">Edit Application</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div ref={comboRef} className="relative">
            <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
            <input
              value={company}
              onChange={(e) => { setCompany(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
                {suggestions.map((s) => (
                  <li
                    key={s.domain}
                    onMouseDown={(e) => { e.preventDefault(); setCompany(s.name); setDomain(s.domain); setShowSuggestions(false); }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-surface-muted cursor-pointer"
                  >
                    {logoErrors[s.domain] ? (
                      <div className="h-6 w-6 rounded-lg bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 flex-shrink-0">
                        {initials(s.name)}
                      </div>
                    ) : (
                      <img
                        src={`https://img.logo.dev/${s.domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}&size=128`}
                        alt={s.name}
                        className="h-6 w-6 rounded-lg object-contain bg-white border border-border flex-shrink-0"
                        onError={() => setLogoErrors((prev) => ({ ...prev, [s.domain]: true }))}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">{s.name}</p>
                      <p className="text-xs text-text-muted truncate">{s.domain}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
          <button
            onClick={() => { onSave({ ...card, company, domain, role }, stage); onClose(); }}
            disabled={!company.trim()}
            className="px-4 py-2 bg-zinc-800 text-white text-xs rounded-lg hover:opacity-85 transition-opacity disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function StaticMobileKanban() {
  return (
    <div className="mt-10 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-muted">
        <div className="h-2.5 w-2.5 rounded-full bg-danger" />
        <div className="h-2.5 w-2.5 rounded-full bg-warning" />
        <div className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs text-text-muted font-medium">Benched — Pipeline</span>
      </div>
      <div className="p-3 flex gap-3 overflow-x-auto">
        {INITIAL_COLUMNS.map((col) => (
          <div key={col.stage} className="bg-surface-muted rounded-xl p-3 min-w-[148px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-secondary truncate mr-2">{col.stage}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${col.badge}`}>
                {col.cards.length}
              </span>
            </div>
            {col.cards.slice(0, 2).map((card) => (
              <div key={card.id} className="bg-surface rounded-lg mb-1.5 border border-border p-2 flex items-center gap-2">
                <CompanyLogoMock company={card.company} domain={card.domain} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-text-primary truncate leading-tight">{card.company}</p>
                  <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">{card.role}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockKanban() {
  const [columns, setColumns] = useState<MockColumn[]>(deepClone(INITIAL_COLUMNS));
  const [activeItem, setActiveItem] = useState<ActiveItem>(null);
  const [editingCard, setEditingCard] = useState<{ card: MockCard; stage: string } | null>(null);
  const activeItemRef = useRef<ActiveItem>(null);
  const savedOrder = useRef<string[]>(INITIAL_COLUMNS.map((c) => c.stage));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columnSortableIds = columns.map((c) => `${COL_PFX}${c.stage}`);

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const isCol = activeItemRef.current?.type === 'column';
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((c) =>
        isCol ? c.id.toString().startsWith(COL_PFX) : !c.id.toString().startsWith(COL_PFX)
      ),
    });
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id.toString();
    if (id.startsWith(COL_PFX)) {
      const stage = id.replace(COL_PFX, '');
      const col = columns.find((c) => c.stage === stage);
      if (col) {
        const item: ActiveItem = { type: 'column', col };
        setActiveItem(item);
        activeItemRef.current = item;
        savedOrder.current = columns.map((c) => c.stage);
      }
    } else {
      const card = columns.flatMap((c) => c.cards).find((c) => c.id === id);
      if (card) {
        const item: ActiveItem = { type: 'card', card };
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
    if (!overId.startsWith(COL_PFX) || activeId === overId) return;
    const activeStage = activeId.replace(COL_PFX, '');
    const overStage = overId.replace(COL_PFX, '');
    setColumns((prev) => {
      const oldIdx = prev.findIndex((c) => c.stage === activeStage);
      const newIdx = prev.findIndex((c) => c.stage === overStage);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const wasColumn = activeItemRef.current?.type === 'column';
    setActiveItem(null);
    activeItemRef.current = null;

    if (wasColumn) {
      if (!over) setColumns((prev) => {
        const order = savedOrder.current;
        return order.map((s) => prev.find((c) => c.stage === s)!);
      });
      return;
    }

    if (!over) return;
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const sourceCol = columns.find((c) => c.cards.some((card) => card.id === activeId));
    if (!sourceCol) return;
    let targetStage = columns.find((c) => c.stage === overId)?.stage;
    if (!targetStage) targetStage = columns.find((c) => c.cards.some((card) => card.id === overId))?.stage;
    if (!targetStage || targetStage === sourceCol.stage) return;

    setColumns((prev) => {
      const next = deepClone(prev);
      const src = next.find((c) => c.stage === sourceCol.stage)!;
      const dst = next.find((c) => c.stage === targetStage)!;
      const idx = src.cards.findIndex((c) => c.id === activeId);
      const [moved] = src.cards.splice(idx, 1);
      dst.cards.unshift(moved);
      return next;
    });
  }

  function handleDragCancel() {
    const wasColumn = activeItemRef.current?.type === 'column';
    setActiveItem(null);
    activeItemRef.current = null;
    if (wasColumn) {
      setColumns((prev) => {
        const order = savedOrder.current;
        return order.map((s) => prev.find((c) => c.stage === s)!);
      });
    }
  }

  function handleEdit(card: MockCard) {
    const stage = columns.find((c) => c.cards.some((cc) => cc.id === card.id))?.stage ?? 'Applied';
    setEditingCard({ card, stage });
  }

  function handleSave(updated: MockCard, newStage: string) {
    setColumns((prev) => {
      const next = deepClone(prev);
      for (const col of next) {
        const idx = col.cards.findIndex((c) => c.id === updated.id);
        if (idx !== -1) { col.cards.splice(idx, 1); break; }
      }
      const dst = next.find((c) => c.stage === newStage);
      if (dst) dst.cards.unshift(updated);
      return next;
    });
  }

  const activeCol = activeItem?.type === 'column' ? activeItem.col : null;
  const activeCard = activeItem?.type === 'card' ? activeItem.card : null;

  return (
    <>
      {/* Mobile: static scrollable kanban */}
      <div className="md:hidden">
        <StaticMobileKanban />
      </div>

      {/* Desktop: interactive kanban */}
      <div className="hidden md:block mt-16 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-muted">
          <div className="h-2.5 w-2.5 rounded-full bg-danger" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning" />
          <div className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="ml-2 text-xs text-text-muted font-medium">Benched — Pipeline</span>
          <button
            onClick={() => setColumns(deepClone(INITIAL_COLUMNS))}
            className="ml-auto flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={columnSortableIds} strategy={horizontalListSortingStrategy}>
            <div className="p-4 grid grid-cols-5 gap-3">
              {columns.map((col) => (
                <SortableColumn key={col.stage} col={col} onEdit={handleEdit} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeCard && (
              <div className="bg-surface rounded-lg border border-border p-2.5 flex items-center gap-2 shadow-xl rotate-1 scale-105">
                <CompanyLogoMock company={activeCard.company} domain={activeCard.domain} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-text-primary truncate leading-tight">{activeCard.company}</p>
                  <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">{activeCard.role}</p>
                </div>
                <span className="text-[9px] text-text-muted shrink-0">{activeCard.time}</span>
              </div>
            )}
            {activeCol && (
              <div className="bg-surface-muted rounded-xl p-3 min-w-0 border-2 border-zinc-300 shadow-2xl opacity-90">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-text-secondary">{activeCol.stage}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeCol.badge}`}>{activeCol.cards.length}</span>
                </div>
                {activeCol.cards.slice(0, 2).map((card) => (
                  <div key={card.id} className="bg-surface rounded-lg mb-1.5 border border-border p-2.5 flex items-center gap-2">
                    <CompanyLogoMock company={card.company} domain={card.domain} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-text-primary truncate leading-tight">{card.company}</p>
                      <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">{card.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {editingCard && (
        <EditModal
          card={editingCard.card}
          currentStage={editingCard.stage}
          onSave={handleSave}
          onClose={() => setEditingCard(null)}
        />
      )}
    </>
  );
}
