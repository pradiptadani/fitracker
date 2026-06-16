import prisma from '@/lib/prisma';

export async function exportBackupJson() {
  const [accounts, categories, transactions, budgets, settings] = await Promise.all([
    prisma.account.findMany(),
    prisma.category.findMany(),
    prisma.transaction.findMany({ orderBy: { date: 'desc' } }),
    prisma.budget.findMany({ include: { category: true } }),
    prisma.setting.findMany(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    accounts,
    categories,
    transactions: transactions.map(t => ({ ...t, amount: Number(t.amount), exchange_rate: Number(t.exchange_rate) })),
    budgets: budgets.map(b => ({ ...b, amount: Number(b.amount) })),
    settings,
  };
}
