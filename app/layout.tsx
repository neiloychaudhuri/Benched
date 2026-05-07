import type { Metadata } from 'next';
import { Manrope, Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Benched — Your recruiting pipeline, on autopilot',
  description:
    'Benched connects to your Gmail and automatically organizes every application, interview, and ghost into a clean pipeline. Zero manual input.',
  openGraph: {
    title: 'Benched',
    description: 'Your recruiting pipeline, on autopilot.',
    siteName: 'Benched',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
