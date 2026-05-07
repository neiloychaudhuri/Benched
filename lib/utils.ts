import { PipelineStage, STAGE_ORDER } from '@/types';

export function normalizeCompanyName(name: string): string {
  return name.trim().toLowerCase();
}

export function isMoreAdvancedStage(
  current: PipelineStage,
  next: PipelineStage
): boolean {
  const currentIdx = STAGE_ORDER.indexOf(current);
  const nextIdx = STAGE_ORDER.indexOf(next);
  return nextIdx > currentIdx;
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Always-uppercase abbreviations
const KEEP_UPPER = new Set([
  'IBM', 'AWS', 'AI', 'API', 'UI', 'UX', 'HR', 'IT', 'PR', 'VC',
  'JPMorgan', 'JP', 'LLC', 'LLP', 'LP', 'USA', 'US', 'UK', 'NY',
  'EY', 'PwC', 'KPMG', 'BCG', 'SAP', 'AMD', 'ARM', 'SAS',
]);

// Always-lowercase connectors
const KEEP_LOWER = new Set(['and', 'or', 'of', 'the', 'at', 'in', 'for', 'to', 'a', 'an']);

export function formatCompanyName(name: string): string {
  if (!name) return name;

  // If the name is all-caps and more than 4 chars, it's probably not an acronym — title-case it
  const words = name.trim().split(/\s+/);

  return words
    .map((word, i) => {
      const upper = word.toUpperCase();
      const lower = word.toLowerCase();

      // Preserve known uppercase abbreviations
      if (KEEP_UPPER.has(upper) || KEEP_UPPER.has(word)) return upper === word ? word : upper;

      // Lowercase connectors (except at start)
      if (i > 0 && KEEP_LOWER.has(lower)) return lower;

      // Preserve mixed-case words that look intentional (e.g. "McKinsey", "DeShaw")
      if (word !== word.toUpperCase() && word !== word.toLowerCase()) return word;

      // Title-case everything else
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
