'use client';

import Link from 'next/link';
import { Clock, X } from 'lucide-react';
import { useRecentStore } from '@/stores/recent-store';
import { cn } from '@/lib/utils';

export function RecentSection() {
  const items = useRecentStore((s) => s.items);
  const removeRecent = useRecentStore((s) => s.removeRecent);

  if (items.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-muted-foreground">
        Recent pages appear here as you navigate.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Clock className="h-3 w-3" />
        Recent
      </div>
      {items.slice(0, 6).map((item) => (
        <div
          key={`${item.id}-${item.type}`}
          className="group flex items-center gap-1"
        >
          <Link
            href={item.href ?? '#'}
            className={cn(
              'flex-1 truncate rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
          <button
            onClick={() => removeRecent(item.id, item.type)}
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
            aria-label={`Remove ${item.label} from recent`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
