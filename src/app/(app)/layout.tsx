import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.userId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">FiTracker</h1>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          <a href="/accounts" className="hover:text-white transition-colors">Accounts</a>
          <a href="/transactions" className="hover:text-white transition-colors">Transactions</a>
        </nav>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
