import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Filter, Repeat2, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ContentCard } from '@/components/shared/content-card';
import { StatCard } from '@/components/shared/stat-card';
import { NewTransactionDialog } from '@/components/transaction/new-transaction-dialog';
import { listAccounts } from '@/lib/services/accounts';
import { listCategories } from '@/lib/services/categories';
import { listTransactions } from '@/lib/services/transactions';
import { formatDate, formatIDR } from '@/lib/utils';

export default async function TransactionsPage() {
  const [transactions, accounts, categories] = await Promise.all([
    listTransactions({ limit: 50 }),
    listAccounts(),
    listCategories(),
  ]);

  const income = transactions.data
    .filter((transaction) => transaction.type === 'credit' && !transaction.is_transfer)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions.data
    .filter((transaction) => transaction.type === 'debit' && !transaction.is_transfer)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const uncategorized = transactions.data.filter(
    (transaction) => !transaction.category && !transaction.is_transfer
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Review income, expenses, and transfers.</p>
        </div>
        <NewTransactionDialog
          accounts={accounts.map((account) => ({ id: account.id, name: account.name }))}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            type: category.type,
          }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Recent income"
          value={formatIDR(income)}
          description="Loaded transactions"
          icon={<ArrowUpRight className="h-4 w-4 text-income" />}
        />
        <StatCard
          title="Recent expenses"
          value={formatIDR(expenses)}
          description="Loaded transactions"
          icon={<ArrowDownLeft className="h-4 w-4 text-expense" />}
        />
        <StatCard
          title="Uncategorized"
          value={uncategorized}
          description="Need category review"
          icon={<Filter className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            Search and filters use API query params next.
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">All accounts</Badge>
            <Badge variant="secondary">All categories</Badge>
            <Badge variant="secondary">Newest first</Badge>
          </div>
        </CardContent>
      </Card>

      <ContentCard
        title="Transaction ledger"
        description={`${transactions.data.length} latest records`}
        contentClassName="p-0"
      >
        {transactions.data.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No transactions yet. Add income or expense to populate ledger.
          </div>
        ) : (
          <div className="divide-y">
            {transactions.data.map((transaction) => {
              const isCredit = transaction.type === 'credit';
              return (
                <Link
                  key={transaction.id}
                  href={`/transactions/${transaction.id}`}
                  className="grid gap-3 rounded-md p-4 transition-colors hover:bg-muted/40 md:grid-cols-[1fr_160px_160px] md:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        isCredit ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                      }`}
                    >
                      {transaction.is_transfer ? (
                        <Repeat2 className="h-4 w-4" />
                      ) : isCredit ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                          {transaction.notes ||
                            transaction.category?.name ||
                            'Uncategorized'}
                        </p>
                        {transaction.is_transfer ? (
                          <Badge variant="outline">Transfer</Badge>
                        ) : null}
                        {!transaction.category && !transaction.is_transfer ? (
                          <Badge variant="destructive">Uncategorized</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.account.name} ·{' '}
                        {transaction.category?.name ?? 'No category'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(transaction.date)}
                  </div>

                  <div className="text-left md:text-right">
                    <p
                      className={`font-semibold ${
                        isCredit ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {formatIDR(Number(transaction.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.currency}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
