'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { LogOut, BarChart2, Share2, LayoutDashboard, ChevronDown } from 'lucide-react';

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const navLinks = [
    { href: '/dashboard', label: 'Pipeline', icon: LayoutDashboard },
    { href: '/stats', label: 'Stats', icon: BarChart2 },
    { href: '/share', label: 'Share', icon: Share2 },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-text-primary tracking-tight">
            Benched
          </Link>
          <div className="flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === href
                    ? 'text-text-primary font-medium'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {profile && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-muted transition-colors"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ''}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-surface-muted border border-border text-text-secondary flex items-center justify-center text-xs font-semibold">
                  {(profile.full_name ?? profile.email)[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-text-muted hidden sm:block">
                {profile.full_name ?? profile.email}
              </span>
              <ChevronDown className="h-3 w-3 text-text-muted" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-sm z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-text-muted truncate">{profile.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-danger hover:bg-danger-light transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
