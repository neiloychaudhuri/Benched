'use client';

import { useState } from 'react';

// Deterministic color from company name
const AVATAR_COLORS = [
  'bg-stone-500', 'bg-zinc-500', 'bg-neutral-600', 'bg-stone-600',
  'bg-zinc-700', 'bg-stone-400', 'bg-zinc-600', 'bg-neutral-500',
  'bg-stone-700', 'bg-zinc-800',
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// Known overrides for companies whose domain != companyname.com
const DOMAIN_OVERRIDES: Record<string, string> = {
  'google': 'google.com',
  'meta': 'meta.com',
  'facebook': 'meta.com',
  'twitter': 'x.com',
  'x': 'x.com',
  'amazon': 'amazon.com',
  'apple': 'apple.com',
  'microsoft': 'microsoft.com',
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
  'airbnb': 'airbnb.com',
  'uber': 'uber.com',
  'lyft': 'lyft.com',
  'stripe': 'stripe.com',
  'shopify': 'shopify.com',
  'salesforce': 'salesforce.com',
  'oracle': 'oracle.com',
  'ibm': 'ibm.com',
  'nvidia': 'nvidia.com',
  'intel': 'intel.com',
  'adobe': 'adobe.com',
  'paypal': 'paypal.com',
  'goldman sachs': 'goldmansachs.com',
  'morgan stanley': 'morganstanley.com',
  'jpmorgan': 'jpmorgan.com',
  'jp morgan': 'jpmorgan.com',
  'bank of america': 'bankofamerica.com',
  'blackrock': 'blackrock.com',
  'mckinsey': 'mckinsey.com',
  'deloitte': 'deloitte.com',
  'pwc': 'pwc.com',
  'kpmg': 'kpmg.com',
  'ey': 'ey.com',
  'ernst & young': 'ey.com',
  'accenture': 'accenture.com',
  'palantir': 'palantir.com',
  'snowflake': 'snowflake.com',
  'databricks': 'databricks.com',
  'openai': 'openai.com',
  'anthropic': 'anthropic.com',
  'scale ai': 'scale.com',
  'two sigma': 'twosigma.com',
  'citadel': 'citadel.com',
  'jane street': 'janestreet.com',
  'bloomberg': 'bloomberg.com',
  'linkedin': 'linkedin.com',
  'dropbox': 'dropbox.com',
  'slack': 'slack.com',
  'zoom': 'zoom.us',
  'atlassian': 'atlassian.com',
  'github': 'github.com',
};

function guessDomain(name: string): string {
  const lower = name.toLowerCase().trim();
  if (DOMAIN_OVERRIDES[lower]) return DOMAIN_OVERRIDES[lower];
  // strip common legal suffixes and punctuation, collapse to one word
  const clean = lower
    .replace(/\b(inc|llc|ltd|corp|co|group|holdings|technologies|solutions|services|global|international)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  return `${clean}.com`;
}

interface CompanyLogoProps {
  name: string;
  size?: 'sm' | 'md';
}

export function CompanyLogo({ name, size = 'md' }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const domain = guessDomain(name);
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const color = colorForName(name);
  const init = initials(name);
  const dim = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';

  if (failed) {
    return (
      <div className={`${dim} ${color} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {init}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className={`${dim} rounded-lg object-contain bg-white border border-border flex-shrink-0`}
      onError={() => setFailed(true)}
    />
  );
}
