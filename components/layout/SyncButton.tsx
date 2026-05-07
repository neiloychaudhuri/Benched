'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SyncSummary } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface SyncButtonProps {
  lastSyncedAt: string | null;
  onSyncComplete?: (summary: SyncSummary) => void;
}

export function SyncButton({ lastSyncedAt, onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setToast(null);
    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' });
      const data: SyncSummary = await res.json();
      if (res.ok) {
        setToast(`Synced — ${data.emails_classified} new emails classified`);
        onSyncComplete?.(data);
      } else {
        setToast('Sync failed. Please try again.');
      }
    } catch {
      setToast('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {lastSyncedAt && (
        <span className="text-xs text-text-muted hidden sm:block">
          Last synced {formatRelativeTime(lastSyncedAt)}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-white rounded-lg text-xs font-medium hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-mono uppercase tracking-wider"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing…' : 'Sync Gmail'}
      </button>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-text-primary text-white px-4 py-2.5 rounded-xl text-sm shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
