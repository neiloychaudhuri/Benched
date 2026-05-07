'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Application, PipelineStage, STAGE_LABELS, STAGE_ORDER } from '@/types';
import { X, RotateCcw, Trash2 } from 'lucide-react';

interface ClearbitSuggestion {
  name: string;
  domain: string;
  logo: string;
}

interface EditApplicationModalProps {
  application: Application;
  onClose: () => void;
  onSave: (updated: Application) => void;
  onDelete: (id: string) => void;
}

export function EditApplicationModal({ application, onClose, onSave, onDelete }: EditApplicationModalProps) {
  const [companyName, setCompanyName] = useState(application.company_name);
  const [roleTitle, setRoleTitle] = useState(application.role_title ?? '');
  const [stage, setStage] = useState<PipelineStage>(application.stage);
  const [notes, setNotes] = useState(application.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [suggestions, setSuggestions] = useState<ClearbitSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const comboRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
      );
      if (res.ok) setSuggestions(await res.json());
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(companyName), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [companyName, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasOriginals =
    application.original_company_name != null ||
    application.original_role_title != null ||
    application.original_stage != null;

  const isEdited =
    companyName !== (application.original_company_name ?? application.company_name) ||
    roleTitle !== (application.original_role_title ?? application.role_title ?? '') ||
    stage !== (application.original_stage ?? application.stage);

  function handleReset() {
    setCompanyName(application.original_company_name ?? application.company_name);
    setRoleTitle(application.original_role_title ?? application.role_title ?? '');
    setStage(application.original_stage ?? application.stage);
  }

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = {
      company_name: companyName.trim(),
      role_title: roleTitle.trim() || null,
      notes: notes.trim() || null,
    };
    if (stage !== application.stage) body.stage = stage;
    const res = await fetch(`/api/applications/${application.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      onSave({ ...application, ...updated });
    }
    setSaving(false);
    onClose();
  }

  function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg text-text-primary">Edit Application</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div ref={comboRef} className="relative">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto py-1">
                {suggestions.map((s) => (
                  <li
                    key={s.domain}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCompanyName(s.name);
                      setShowSuggestions(false);
                    }}
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
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Role</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as PipelineStage)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          {confirmDelete ? (
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-danger font-medium">Delete this application?</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Keep it
                </button>
                <button
                  onClick={() => { onDelete(application.id); onClose(); }}
                  className="px-4 py-2 bg-danger text-white text-xs rounded-lg hover:opacity-85 transition-opacity"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {hasOriginals && isEdited && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to original
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !companyName.trim()}
                  className="px-4 py-2 bg-zinc-800 text-white text-xs rounded-lg hover:opacity-85 transition-opacity disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
