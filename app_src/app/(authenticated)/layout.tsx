import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

export const dynamic = 'force-dynamic';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
