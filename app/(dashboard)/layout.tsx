import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Profile } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, gmail_last_synced_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile as Profile | null} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
