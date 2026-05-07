'use client';

import { useState } from 'react';

interface CompanyLogoMockProps {
  company: string;
  domain: string;
  size?: 'sm' | 'md';
}

export function CompanyLogoMock({ company, domain, size = 'sm' }: CompanyLogoMockProps) {
  const [failed, setFailed] = useState(false);

  const dim = size === 'md' ? 'w-7 h-7' : 'w-6 h-6';
  const imgDim = 'w-full h-full';
  const textSize = size === 'md' ? 'text-[10px]' : 'text-[9px]';

  if (failed) {
    return (
      <span className={`inline-flex items-center justify-center ${dim} rounded bg-surface-muted border border-border ${textSize} font-bold text-text-secondary shrink-0`}>
        {company[0]}
      </span>
    );
  }

  return (
    <img
      src={`https://img.logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}&size=128`}
      alt={company}
      className={`${dim} rounded object-cover shrink-0`}
      onError={() => setFailed(true)}
    />
  );
}
