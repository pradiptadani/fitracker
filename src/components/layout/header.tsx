'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getDefaultMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonth(monthStr: string, delta: number): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return date.toISOString().slice(0, 7);
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
function formatMonthName(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return monthFormatter.format(date);
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const month = searchParams.get('month') ?? getDefaultMonth();

  function navigate(nextMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', nextMonth);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <header className="h-16 border-b border-border bg-card text-card-foreground flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(shiftMonth(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold min-w-[120px] text-center">
          {formatMonthName(month)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(shiftMonth(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-4" />
    </header>
  );
}
