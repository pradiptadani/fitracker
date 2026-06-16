'use client';

import { useState } from 'react';
import { BarChart3, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { CategoryChart } from '@/components/reports/category-chart';
import { TrendChart } from '@/components/reports/trend-chart';
import { BudgetBars } from '@/components/reports/budget-bars';
import {
  useAccountReport,
  useBudgetReport,
  useCashflowReport,
  useCategoryReport,
  useMonthlyReport,
  useMonthlySummaryAdvice,
  useRunMonthlySummary,
} from '@/hooks/use-reports';
import { getCurrentMonth } from '@/lib/utils';
import { formatIDR } from '@/lib/utils';

export function ReportsDashboard() {
  const month = getCurrentMonth();
  const monthly = useMonthlyReport(month);
  const cashflow = useCashflowReport();
  const category = useCategoryReport({ startDate: undefined, endDate: undefined });
  const budget = useBudgetReport();
  const account = useAccountReport();
  const advice = useMonthlySummaryAdvice(month);
  const runSummary = useRunMonthlySummary();

  const [selectedMonth, setSelectedMonth] = useState(month);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review finance reports and generate monthly AI summary."
        actions={
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button
              onClick={() => runSummary.mutate(selectedMonth)}
              disabled={runSummary.isPending}
            >
              {runSummary.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Run summary
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Income"
          value={monthly.data ? formatIDR(monthly.data.totalIncome) : '—'}
          icon={TrendingUp}
          loading={monthly.isLoading}
        />
        <SummaryCard
          title="Expenses"
          value={monthly.data ? formatIDR(monthly.data.totalExpenses) : '—'}
          icon={TrendingDown}
          loading={monthly.isLoading}
        />
        <SummaryCard
          title="Net cashflow"
          value={monthly.data ? formatIDR(monthly.data.netCashflow) : '—'}
          icon={BarChart3}
          loading={monthly.isLoading}
        />
        <SummaryCard
          title="Savings rate"
          value={monthly.data ? `${monthly.data.savingsRate.toFixed(1)}%` : '—'}
          icon={BarChart3}
          loading={monthly.isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cashflow (last 6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {cashflow.isLoading ? (
              <LoadingState rows={3} />
            ) : cashflow.data ? (
              <TrendChart data={cashflow.data} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top expense categories</CardTitle>
          </CardHeader>
          <CardContent>
            {category.isLoading ? (
              <LoadingState rows={3} />
            ) : category.data ? (
              <CategoryChart data={category.data} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget variance</CardTitle>
        </CardHeader>
        <CardContent>
          {budget.isLoading ? (
            <LoadingState rows={3} />
          ) : budget.data ? (
            <BudgetBars data={budget.data} />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account balances</CardTitle>
        </CardHeader>
        <CardContent>
          {account.isLoading ? (
            <LoadingState rows={3} />
          ) : account.data && account.data.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {account.data.map((a) => {
                const balance = (a.balanceIdr as number | undefined) ?? 0;
                return (
                  <div key={String(a.accountId)} className="rounded-lg border p-3">
                    <p className="font-medium">{String(a.accountName)}</p>
                    <p className="text-sm text-muted-foreground">{String(a.type)}</p>
                    <p className="mt-2 text-lg font-semibold">{formatIDR(balance)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No accounts yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI advice for {selectedMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          {advice.isLoading ? (
            <LoadingState rows={2} />
          ) : advice.data ? (
            <div className="space-y-3">
              <p className="text-sm">{advice.data.summary}</p>
              {advice.data.wins.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-income">Wins</p>
                  <ul className="ml-4 list-disc text-sm">
                    {advice.data.wins.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {advice.data.risks.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-expense">Risks</p>
                  <ul className="ml-4 list-disc text-sm">
                    {advice.data.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {advice.data.recommendations.length > 0 ? (
                <div>
                  <p className="text-sm font-medium">Recommendations</p>
                  <ul className="ml-4 list-disc text-sm">
                    {advice.data.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No advice yet. Run the summary above to generate it.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <div className="mt-2 h-7 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            )}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
