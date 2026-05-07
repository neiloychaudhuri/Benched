'use client';

import { useEffect, useRef, useState } from 'react';
import { RecruitingStats } from '@/types';
import { WrappedCard } from '@/components/share/WrappedCard';
import { Download, Link2 } from 'lucide-react';

const ACCENT_OPTIONS = [
  { label: 'Zinc', value: '#3f3f46' },
  { label: 'Slate', value: '#475569' },
  { label: 'Stone', value: '#78716C' },
  { label: 'Green', value: '#16A34A' },
  { label: 'Rose', value: '#E11D48' },
];

function getSeason(): string {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  if (month >= 8 && month <= 11) return `Fall ${year}`;
  if (month >= 0 && month <= 4) return `Spring ${year}`;
  return `Summer ${year}`;
}

export default function SharePage() {
  const [stats, setStats] = useState<RecruitingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0].value);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  async function handleDownload() {
    if (!cardRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = 'benched-wrapped.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function handleCopyLink() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-surface-muted rounded-lg w-40 animate-pulse" />
        <div className="h-80 bg-surface-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-text-primary">Share Your Wrapped</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Card preview */}
        <div className="flex-1 overflow-auto">
          <WrappedCard
            ref={cardRef}
            stats={stats}
            season={getSeason()}
            accentColor={accent}
          />
        </div>

        {/* Controls */}
        <div className="w-full lg:w-64 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text-primary mb-3">Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAccent(opt.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    accent === opt.value
                      ? 'border-text-primary scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-85 transition-opacity"
            >
              <Download className="h-4 w-4" />
              Download as PNG
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-text-primary rounded-xl px-4 py-3 text-sm font-semibold hover:bg-surface-muted transition-colors"
            >
              <Link2 className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy share link'}
            </button>
          </div>

          <div className="bg-surface-muted rounded-xl p-4">
            <p className="text-xs text-text-muted leading-relaxed">
              Your Wrapped card shows only your aggregate stats — never any personal email content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
