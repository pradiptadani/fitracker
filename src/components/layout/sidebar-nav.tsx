'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Target,
  Repeat,
  BarChart3,
  Mail,
  Settings,
  LogOut,
} from 'lucide-react';
import { RecentSection } from './recent-section';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Accounts', href: '/accounts', icon: Wallet },
  { label: 'Categories', href: '/categories', icon: Tags },
  { label: 'Budgets', href: '/budgets', icon: Target },
  { label: 'Recurring', href: '/recurring', icon: Repeat },
  { label: 'Email Imports', href: '/email-imports', icon: Mail },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <aside className="w-64 border-r border-border bg-card text-card-foreground flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="text-xl font-bold tracking-tight">FiTracker</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border">
          <RecentSection />
        </div>
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
