'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRecentStore, type RecentItemType } from '@/stores/recent-store';

const ROUTE_TO_LABEL: Record<string, { label: string; type: RecentItemType }> = {
  '/dashboard': { label: 'Dashboard', type: 'report' },
  '/transactions': { label: 'Transactions', type: 'report' },
  '/accounts': { label: 'Accounts', type: 'report' },
  '/categories': { label: 'Categories', type: 'report' },
  '/budgets': { label: 'Budgets', type: 'report' },
  '/recurring': { label: 'Recurring', type: 'report' },
  '/email-imports': { label: 'Email imports', type: 'report' },
  '/reports': { label: 'Reports', type: 'report' },
  '/settings': { label: 'Settings', type: 'report' },
};

export function RouteTracker() {
  const pathname = usePathname();
  const addRecent = useRecentStore((s) => s.addRecent);

  useEffect(() => {
    if (!pathname) return;
    const meta = ROUTE_TO_LABEL[pathname];
    if (!meta) return;
    addRecent({
      id: pathname,
      type: meta.type,
      label: meta.label,
      href: pathname,
    });
  }, [pathname, addRecent]);

  return null;
}
