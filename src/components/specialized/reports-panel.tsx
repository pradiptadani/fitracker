import { BarChart3, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIDR, formatIDRShort } from '@/lib/utils';
import type { MonthlySummaryPayload } from '@/types';

interface ReportsPanelProps {
  report: MonthlySummaryPayload;
}

export function ReportsPanel({ report }: ReportsPanelProps) {
  const topCategories = report.categoryBreakdown.slice(0, 5);
  const largestAccount = [...report.accountBalances].sort((a, b) => b.balanceIdr - a.balanceIdr)[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Income" value={formatIDR(report.totalIncome)} icon={TrendingUp} tone="income" />
        <MetricCard title="Expenses" value={formatIDR(report.totalExpenses)} icon={TrendingDown} tone="expense" />
        <MetricCard title="Net cashflow" value={formatIDR(report.netCashflow)} icon={BarChart3} tone={report.netCashflow >= 0 ? 'income' : 'expense'} />
        <MetricCard title="Savings rate" value={`${report.savingsRate.toFixed(1)}%`} icon={Wallet} tone="neutral" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top spending categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No spending data for {report.month}.</p>
            ) : (
              topCategories.map((category) => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.categoryName}</span>
                    <span className="text-muted-foreground">{formatIDR(category.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(category.percentageOfExpenses, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget variance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.budgetVariance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active budgets overlap this month.</p>
            ) : (
              report.budgetVariance.slice(0, 5).map((budget) => (
                <div key={budget.categoryId} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{budget.categoryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatIDRShort(budget.actualAmount)} of {formatIDRShort(budget.budgetAmount)}
                    </p>
                  </div>
                  <span className={budget.varianceAmount > 0 ? 'text-expense' : 'text-income'}>
                    {budget.variancePercent.toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {largestAccount ? (
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Largest account balance</p>
              <p className="text-xl font-semibold">{largestAccount.accountName}</p>
            </div>
            <p className="text-xl font-semibold">{formatIDR(largestAccount.balanceIdr)}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'income' | 'expense' | 'neutral';
}) {
  const toneClass = tone === 'income' ? 'text-income' : tone === 'expense' ? 'text-expense' : 'text-foreground';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
          </div>
          <Icon className={`h-5 w-5 ${toneClass}`} />
        </div>
      </CardContent>
    </Card>
  );
}
