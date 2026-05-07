'use client';

import { useState } from 'react';
import { Sparkles, PartyPopper, Ghost } from 'lucide-react';
import { SyncSummary } from '@/types';

type Step = 'welcome' | 'scanning' | 'done';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  async function startScan() {
    setStep('scanning');
    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' });
      if (res.ok) {
        const data: SyncSummary = await res.json();
        setSummary(data);
      }
    } catch {
      // Proceed to done even on error
    }
    setStep('done');
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
        {step === 'welcome' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-2xl mb-4 mx-auto">
              <Sparkles className="h-8 w-8 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Welcome to Benched
            </h2>
            <p className="text-text-secondary mb-8">
              Let&apos;s scan your inbox and build your recruiting pipeline.
            </p>
            <button
              onClick={startScan}
              className="w-full bg-zinc-800 text-white rounded-xl px-6 py-3 font-semibold hover:opacity-85 transition-opacity"
            >
              Start scanning
            </button>
          </>
        )}

        {step === 'scanning' && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="h-12 w-12 border-4 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Scanning your Gmail…
            </h2>
            <p className="text-text-secondary text-sm">
              We&apos;re classifying every recruiting email. This may take a minute.
            </p>
          </>
        )}

        {step === 'done' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-success-light rounded-2xl mb-4 mx-auto">
              <PartyPopper className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {summary
                ? `Found ${summary.new_applications} applications`
                : "You're all set!"}
            </h2>
            {summary && (
              <div className="my-6 grid grid-cols-2 gap-3">
                <div className="bg-surface-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-text-primary">
                    {summary.emails_scanned}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">Emails scanned</p>
                </div>
                <div className="bg-surface-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-text-primary">
                    {summary.emails_classified}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">Classified</p>
                </div>
                <div className="bg-surface-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-text-primary">
                    {summary.new_applications}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">Applications</p>
                </div>
                <div className="bg-ghost-light rounded-xl p-3">
                  <p className="text-2xl font-bold text-ghost">
                    {summary.ghosts_detected}
                  </p>
                  <p className="text-xs text-ghost/70 mt-0.5 flex items-center justify-center gap-1">
                    <Ghost className="h-3 w-3" />
                    Ghosted
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={onComplete}
              className="w-full bg-zinc-800 text-white rounded-xl px-6 py-3 font-semibold hover:opacity-85 transition-opacity"
            >
              See my pipeline
            </button>
          </>
        )}
      </div>
    </div>
  );
}
