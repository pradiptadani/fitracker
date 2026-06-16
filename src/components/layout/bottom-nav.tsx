'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  MoreHorizontal,
} from 'lucide-react';

const mobileItems = [
  { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Trans', href: '/transactions', icon: Receipt },
  // FAB sits between these
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'More', href: '/settings', icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card text-card-foreground flex items-center justify-around px-2 pb-safe md:hidden z-40">
      {/* 2 left items */}
      {mobileItems.slice(0, 2).map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 w-14 text-center transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Spacer for Floating Add Button (FAB) */}
      <div className="w-14 h-5" />

      {/* 2 right items */}
      {mobileItems.slice(2).map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 w-14 text-center transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
