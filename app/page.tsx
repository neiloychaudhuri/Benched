import Link from 'next/link';
import { ArrowRight, Inbox, Sparkles, BarChart2, Ghost, Share2, Shield } from 'lucide-react';
import Iridescence from '@/components/ui/Iridescence';
import { MockKanban } from '@/components/ui/MockKanban';
import { CompanyLogoMock } from '@/components/ui/CompanyLogoMock';
import CurvedLoop from '@/components/ui/CurvedLoop';
import Stack from '@/components/ui/Stack';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <span className="font-semibold text-text-primary tracking-tight">Benched</span>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-xs font-medium transition-colors font-mono uppercase tracking-wider"
          >
            Connect Gmail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-60">
          <Iridescence color={[1, 0.72, 0.1]} speed={0.4} amplitude={0.08} mouseReact={false} />
        </div>
        <div aria-hidden className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-background/75 to-transparent" />
        <div aria-hidden className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />

        <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">

          <h1 className="font-serif font-bold text-[3rem] md:text-[3.90rem] text-text-primary leading-[1.1] tracking-tight mb-6">
            Your recruiting pipeline,
            <br />
            on autopilot.
          </h1>
          {/* Flow diagram — stacked cards */}
          <div className="mb-10" style={{ width: 224, height: 192 }}>
            <Stack
              autoplay
              autoplayDelay={2800}
              sendToBackOnClick
              randomRotation
              sensitivity={120}
              cards={[
                <div key="01" className="w-full h-full bg-surface border border-border rounded-2xl p-4 flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] text-text-muted">01</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-muted border border-border mb-3">
                    <Inbox className="h-3.5 w-3.5 text-text-secondary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-snug mb-1">Connect to Gmail</p>
                  <p className="text-[11px] text-text-muted leading-snug">One-click OAuth. Read-only access.</p>
                </div>,
                <div key="02" className="w-full h-full bg-surface border border-border rounded-2xl p-4 flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] text-text-muted">02</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-muted border border-border mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-text-secondary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-snug mb-1">AI reads your inbox</p>
                  <p className="text-[11px] text-text-muted leading-snug">Every recruiting email, classified automatically.</p>
                </div>,
                <div key="03" className="w-full h-full bg-surface border border-border rounded-2xl p-4 flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] text-text-muted">03</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-muted border border-border mb-3">
                    <BarChart2 className="h-3.5 w-3.5 text-text-secondary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-snug mb-1">Pipeline auto-built</p>
                  <p className="text-[11px] text-text-muted leading-snug">Zero manual input. Live Kanban board.</p>
                </div>,
              ]}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-xs hover:opacity-80 transition-opacity font-mono uppercase tracking-wider"
              style={{ background: '#18181b', color: '#fafaf9' }}
            >
              Connect Gmail — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Read-only access · No emails stored · Takes 30 seconds
          </p>

          <MockKanban />
        </section>
      </div>

      {/* Stats strip — CurvedLoop on mobile, static grid on desktop */}
      <div className="border-y border-border bg-surface overflow-hidden">
        <div className="md:hidden text-text-primary">
          <CurvedLoop
            marqueeText="Applications Tracked ✦ No Spreadsheet ✦ Ghost Detection ✦ Recruiting Wrapped ✦"
            speed={1.4}
            curveAmount={50}
            interactive={false}
            wrapperClassName="flex items-center justify-center w-full py-2"
            className="text-[2.4rem] font-semibold"
          />
        </div>
        <div className="hidden md:grid grid-cols-4 gap-6 max-w-6xl mx-auto px-6 py-5">
          {[
            ['Applications tracked', 'from your inbox'],
            ['No spreadsheet', 'no manual updates'],
            ['Ghost detection', '14-day silence rule'],
            ['Recruiting Wrapped', 'shareable stats card'],
          ].map(([stat, desc]) => (
            <div key={stat} className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-text-primary">{stat}</span>
              <span className="text-xs text-text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">How it works</p>
        <h2 className="font-serif text-4xl text-text-primary mb-16 max-w-lg leading-snug">
          From inbox to pipeline in 30 seconds.
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              icon: Inbox,
              title: 'Connect your Gmail',
              desc: 'One-click OAuth. Read-only access. We see subject lines and snippets — nothing more.',
            },
            {
              step: '02',
              icon: Sparkles,
              title: 'AI classifies everything',
              desc: 'Benched reads every recruiting email and categorizes it automatically: applied, screen, interview, offer, ghosted.',
            },
            {
              step: '03',
              icon: BarChart2,
              title: 'Your pipeline, live',
              desc: 'A Kanban board updates in real time. No imports, no tagging, no maintenance.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-xs text-text-muted font-medium">{item.step}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="inline-flex items-center justify-center w-10 h-10 bg-surface-muted border border-border rounded-xl mb-4">
                  <Icon className="h-4 w-4 text-text-secondary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ghost detector */}
      <section className="bg-surface border-y border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-10 h-10 bg-surface-muted border border-border rounded-xl mb-6">
                <Ghost className="h-4 w-4 text-text-secondary" />
              </div>
              <h2 className="font-serif text-4xl text-text-primary mb-4 leading-snug">
                Know exactly when you&apos;re being ghosted.
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                After 14 days of silence, Benched automatically flags an application as ghosted.
                See the full list, track the pattern, and share it.
              </p>
            </div>
            <div className="bg-surface-muted border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <Ghost className="h-4 w-4 text-text-muted" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Ghost Report</span>
              </div>
              {[
                { company: 'Meta', domain: 'meta.com', role: 'Product Manager', days: 21 },
                { company: 'Shopify', domain: 'shopify.com', role: 'Backend Engineer', days: 18 },
                { company: 'Polarity', domain: 'polarity.so', role: 'iOS Engineer', days: 16 },
                { company: 'OpenAI', domain: 'openai.com', role: 'Data Scientist', days: 14 },
              ].map((item) => (
                <div key={item.company} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <CompanyLogoMock company={item.company} domain={item.domain} />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{item.company}</p>
                      <p className="text-[10px] text-text-muted">{item.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted font-medium">{item.days}d silent</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wrapped */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="inline-block bg-gradient-to-br from-zinc-100 to-white border border-zinc-200 rounded-2xl p-8 shadow-lg text-left w-full max-w-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Benched Wrapped
            </p>
            <p className="text-lg font-bold text-text-primary mb-5 font-serif">Fall 2025</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                ['Applied', '48'],
                ['Response Rate', '34%'],
                ['Interviews', '18%'],
                ['Ghosted', '9'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white border border-border rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-text-primary">{value}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-text-muted">getbenched.co</p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-10 h-10 bg-surface-muted border border-border rounded-xl mb-6">
              <Share2 className="h-4 w-4 text-text-secondary" />
            </div>
            <h2 className="font-serif text-4xl text-text-primary mb-4 leading-snug">
              Recruiting Wrapped.
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              At the end of recruiting season, generate a shareable card with your full stats.
              Post it on LinkedIn or Twitter. Show your grind.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-surface border-t border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-8">
            <Shield className="h-3 w-3" />
            Read-only Gmail access · Snippet-only storage · Your data is yours
          </div>
          <h2 className="font-serif text-5xl text-text-primary mb-8 max-w-lg leading-[1.1]">
            Stop tracking applications in a spreadsheet.
          </h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-xs hover:opacity-80 transition-opacity font-mono uppercase tracking-wider"
            style={{ background: '#18181b', color: '#fafaf9' }}
          >
            Connect Gmail — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-xs text-text-muted">
            Built by{' '}
            <Link href="https://neiloy.me" className="underline underline-offset-4 hover:text-text-secondary transition-colors">
              Neiloy Chaudhuri
            </Link>{' '}
            · No spam, ever.
          </p>
        </div>
      </section>
    </div>
  );
}
