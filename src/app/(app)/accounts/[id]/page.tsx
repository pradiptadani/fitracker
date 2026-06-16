import { notFound } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, CreditCard, Landmark, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ContentCard } from '@/components/shared/content-card';
import { StatCard } from '@/components/shared/stat-card';
import { NewTransactionDialog } from '@/components/transaction/new-transaction-dialog';
import { AccountDeleteButton } from '@/components/accounts/account-delete-button';
import { getAccountById } from '@/lib/services/accounts';
import { listCategories } from '@/lib/services/categories';
import { listTransactions } from '@/lib/services/transactions';
import { formatDate, formatIDR } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

const ICON_BY_TYPE = {
  ASSET: Wallet,
  LIABILITY: CreditCard,
  EQUITY: Landmark,
  INCOME: ArrowUpRight,
  EXPENSE: ArrowDownRight,
} as const;

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [account, categories, recent] = await Promise.all([
    getAccountById(id),
    listCategories(),
    listTransactions({ limit: 20 }),
  ]);

  if (!account) notFound();

  const Icon = ICON_BY_TYPE[account.type];
  const accountTxs = recent.data.filter((t) => t.account_id === account.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Icon className="h-5 w-5" />
            {account.name}
          </h2>
          <p className="text-muted-foreground">
            {account.type} · normal balance {account.normal_balance} · {account.currency}
          </p>
        </div>
        <AccountDeleteButton id={account.id} name={account.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Current balance"
          value={formatIDR(account.balance)}
          description={`Updated ${formatDate(account.updated_at)}`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Recent transactions"
          value={accountTxs.length}
          description="Last 20 ledger entries"
          icon={<ArrowDownRight className="h-4 w-4" />}
        />
        <StatCard
          title="Currency"
          value={account.currency}
          description={account.name}
          icon={<Landmark className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Add transaction to this account</h3>
        <NewTransactionDialog
          accounts={[{ id: account.id, name: account.name }]}
          categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
        />
      </div>

      <ContentCard
        title="Recent activity"
        description={`Latest ${accountTxs.length} transactions on this account`}
        contentClassName="p-0"
      >
        {accountTxs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No transactions yet for this account.
          </div>
        ) : (
          <div className="divide-y">
            {accountTxs.map((t) => {
              const isCredit = t.type === 'credit';
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {t.notes || t.category?.name || (t.is_transfer ? 'Transfer' : 'Uncategorized')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.date)} · {t.category?.name ?? 'No category'}
                      {t.is_transfer ? ' · Transfer' : ''}
                    </p>
                  </div>
                  <Badge variant={isCredit ? 'default' : 'destructive'}>
                    {isCredit ? '+' : '-'}
                    {formatIDR(Number(t.amount))}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
