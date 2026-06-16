import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Repeat2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentCard } from '@/components/shared/content-card';
import { TransactionDeleteButton } from '@/components/transaction/transaction-delete-button';
import { TransactionEditForm } from '@/components/transaction/transaction-edit-form';
import { getTransactionById } from '@/lib/services/transactions';
import { listAccounts } from '@/lib/services/accounts';
import { listCategories } from '@/lib/services/categories';
import { formatDate, formatIDR } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [transaction, accounts, categories] = await Promise.all([
    getTransactionById(id),
    listAccounts(),
    listCategories(),
  ]);

  if (!transaction) notFound();

  // Coerce Date fields to ISO strings for the client-side edit form.
  const formTransaction = {
    ...transaction,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    created_at:
      transaction.created_at instanceof Date
        ? transaction.created_at.toISOString()
        : transaction.created_at,
  };

  const isCredit = transaction.type === 'credit';
  const isTransfer = transaction.is_transfer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Transaction</h2>
          <p className="text-muted-foreground">
            Posted on {formatDate(transaction.date)} to {transaction.account.name}.
          </p>
        </div>
        <TransactionDeleteButton id={transaction.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${isCredit ? 'text-income' : 'text-expense'}`}
            >
              {isCredit ? '+' : '-'}
              {formatIDR(Number(transaction.amount))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transaction.currency} · rate {Number(transaction.exchange_rate).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isTransfer ? (
                <Repeat2 className="h-5 w-5 text-transfer" />
              ) : isCredit ? (
                <ArrowUpRight className="h-5 w-5 text-income" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-expense" />
              )}
              <span className="text-lg font-semibold">
                {isTransfer ? 'Transfer' : isCredit ? 'Income' : 'Expense'}
              </span>
            </div>
            {transaction.category ? (
              <Badge variant="secondary" className="mt-2">
                {transaction.category.name}
              </Badge>
            ) : !isTransfer ? (
              <Badge variant="destructive" className="mt-2">
                Uncategorized
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{formatDate(transaction.date)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {transaction.notes ? (
        <ContentCard title="Notes">
          <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
        </ContentCard>
      ) : null}

      <ContentCard
        title="Edit"
        description="Update account, category, date, or notes. Amount and type are read-only here."
      >
        <TransactionEditForm
          transaction={formTransaction}
          accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
        />
      </ContentCard>

      <div>
        <Button asChild variant="outline">
          <Link href="/transactions">Back to ledger</Link>
        </Button>
      </div>
    </div>
  );
}
