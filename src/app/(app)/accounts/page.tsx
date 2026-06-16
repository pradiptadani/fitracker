import { CreditCard, Landmark, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ContentCard } from '@/components/shared/content-card';
import { StatCard } from '@/components/shared/stat-card';
import { NewAccountButton } from '@/components/accounts/new-account-button';
import { AccountDeleteButton } from '@/components/accounts/account-delete-button';
import { listAccounts } from '@/lib/services/accounts';
import { formatDate, formatIDR } from '@/lib/utils';

const accountTypeMeta = {
  ASSET: { label: 'Asset', icon: Wallet, className: 'bg-income/10 text-income' },
  LIABILITY: { label: 'Liability', icon: CreditCard, className: 'bg-expense/10 text-expense' },
  EQUITY: { label: 'Equity', icon: Landmark, className: 'bg-primary/10 text-primary' },
  INCOME: { label: 'Income', icon: TrendingUp, className: 'bg-income/10 text-income' },
  EXPENSE: { label: 'Expense', icon: TrendingDown, className: 'bg-expense/10 text-expense' },
};

export default async function AccountsPage() {
  const accounts = await listAccounts();

  const assets = accounts
    .filter((account) => account.type === 'ASSET')
    .reduce((sum, account) => sum + account.balance, 0);
  const liabilities = accounts
    .filter((account) => account.type === 'LIABILITY')
    .reduce((sum, account) => sum + account.balance, 0);
  const netWorth = assets - liabilities;
  const currencyCount = new Set(accounts.map((account) => account.currency)).size;
  const grouped = accounts.reduce<Record<string, typeof accounts>>((acc, account) => {
    acc[account.type] = [...(acc[account.type] ?? []), account];
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Balances computed from posted transactions.</p>
        </div>
        <NewAccountButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Net worth"
          value={formatIDR(netWorth)}
          description="Assets minus liabilities"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Assets"
          value={formatIDR(assets)}
          description="Cash and bank accounts"
          icon={<TrendingUp className="h-4 w-4 text-income" />}
        />
        <StatCard
          title="Liabilities"
          value={formatIDR(liabilities)}
          description="Credit and debt accounts"
          icon={<TrendingDown className="h-4 w-4 text-expense" />}
        />
        <StatCard
          title="Currencies"
          value={currencyCount}
          description={`${accounts.length} total accounts`}
          icon={<Landmark className="h-4 w-4" />}
        />
      </div>

      <ContentCard title="Account list" description="Grouped by accounting type." contentClassName="space-y-6">
        {accounts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">No accounts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create cash, bank, e-wallet, or credit account before adding transactions.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([type, items]) => {
            const meta = accountTypeMeta[type as keyof typeof accountTypeMeta];
            const Icon = meta.icon;
            const total = items.reduce((sum, account) => sum + account.balance, 0);

            return (
              <section key={type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full p-2 ${meta.className}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{meta.label}</h3>
                      <p className="text-xs text-muted-foreground">{items.length} accounts</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatIDR(total)}</p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {items.map((account) => (
                    <div key={account.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{account.name}</p>
                            <Badge variant="secondary">{account.currency}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Normal {account.normal_balance} · Updated{' '}
                            {formatDate(account.updated_at)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p
                            className={
                              account.balance >= 0
                                ? 'text-right font-semibold text-income'
                                : 'text-right font-semibold text-expense'
                            }
                          >
                            {formatIDR(account.balance)}
                          </p>
                          <AccountDeleteButton id={account.id} name={account.name} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </ContentCard>
    </div>
  );
}
