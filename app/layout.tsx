import type { Metadata } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Benched',
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
      className={`${manrope.variable} ${plusJakartaSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
