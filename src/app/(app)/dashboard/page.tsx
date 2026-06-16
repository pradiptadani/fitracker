import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Landmark, Plus, ReceiptText, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ContentCard } from '@/components/shared/content-card';
import { StatCard } from '@/components/shared/stat-card';
import { listAccounts } from '@/lib/services/accounts';
import { getMonthlyReport } from '@/lib/services/reports';
import { listTransactions } from '@/lib/services/transactions';
import { formatDate, formatIDR, formatIDRShort, getCurrentMonth } from '@/lib/utils';

interface DashboardPageProps {
  searchParams: Promise<{ month?: string }>;
}

function resolveMonth(value: string | undefined): string {
  return /^\d{4}-\d{2}$/.test(value ?? '') ? (value as string) : getCurrentMonth();
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const month = resolveMonth(params.month);

  const [accounts, report, transactions] = await Promise.all([
    listAccounts(),
    getMonthlyReport(month),
    listTransactions({ limit: 6 }),
  ]);

  const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
  const cashAccounts = accounts.filter((account) => account.type === 'ASSET');
  const topAccounts = [...accounts]
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .slice(0, 4);
  const topCategories = report.categoryBreakdown.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Financial overview for {month}.</p>
        </div>
        <Button asChild>
          <Link href="/transactions">
            <Plus className="mr-2 h-4 w-4" />
            Add transaction
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Net worth"
          value={formatIDR(netWorth)}
          description={`${accounts.length} accounts`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Month income"
          value={formatIDR(report.totalIncome)}
          description={month}
          icon={<ArrowUpRight className="h-4 w-4 text-income" />}
        />
        <StatCard
          title="Month expenses"
          value={formatIDR(report.totalExpenses)}
          description={month}
          icon={<ArrowDownRight className="h-4 w-4 text-expense" />}
        />
        <StatCard
          title="Savings rate"
          value={`${report.savingsRate.toFixed(1)}%`}
          description={formatIDR(report.netCashflow)}
          icon={<Landmark className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ContentCard
          title="Recent transactions"
          description="Latest money movement across accounts."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions">View all</Link>
            </Button>
          }
        >
          {transactions.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.data.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/transactions/${transaction.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {transaction.notes || transaction.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)} · {transaction.account.name}
                    </p>
                  </div>
                  <p
                    className={
                      transaction.type === 'credit'
                        ? 'font-semibold text-income'
                        : 'font-semibold text-expense'
                    }
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatIDR(Number(transaction.amount))}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </ContentCard>

        <ContentCard
          title="Accounts"
          description="Top balances by absolute value."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/accounts">Manage</Link>
            </Button>
          }
        >
          {topAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create first account to start tracking.
            </p>
          ) : (
            <div className="space-y-4">
              {topAccounts.map((account) => (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="block space-y-2 rounded-md transition-colors hover:bg-muted/40 -mx-2 px-2 py-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{account.name}</span>
                    <span className="text-muted-foreground">
                      {formatIDR(account.balance)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${
                          Math.min(
                            (Math.abs(account.balance) /
                              Math.max(Math.abs(netWorth), 1)) *
                              100,
                            100
                          )
                        }%`,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ContentCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard title="Spending breakdown" description={`Top expense categories for ${month}.`}>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categorized spending this month.
            </p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between rounded-lg bg-muted/40 p-3"
                >
                  <span className="font-medium">{category.categoryName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatIDRShort(category.amount)} · {category.percentageOfExpenses.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        <ContentCard title="Cash accounts" description="Asset accounts available for spending.">
          {cashAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No asset accounts found.</p>
          ) : (
            <div className="space-y-3">
              {cashAccounts.slice(0, 5).map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <ReceiptText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.currency}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatIDR(account.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
}
