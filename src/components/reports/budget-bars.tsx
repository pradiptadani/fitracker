'use client';

interface BudgetBarsProps {
  data: Array<Record<string, unknown>>;
}

export function BudgetBars({ data }: BudgetBarsProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No budget variance data yet. Create a budget first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((row, i) => {
        const name = String(row.categoryName ?? row.category_name ?? '—');
        const budget = Number(row.budgetAmount ?? 0);
        const actual = Number(row.actualAmount ?? 0);
        const pct = budget > 0 ? Math.min((actual / budget) * 100, 100) : 0;
        const overBudget = actual > budget;

        return (
          <div key={`${name}-${i}`} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{name}</span>
              <span className="text-muted-foreground">
                {formatCompact(actual)} / {formatCompact(budget)}
                {overBudget ? ' (over)' : ''}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={overBudget ? 'h-2 rounded-full bg-expense' : 'h-2 rounded-full bg-primary'}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return n.toString();
}
