import prisma from '@/lib/prisma';
import { computeBalance } from '@/lib/balance';
import type { AccountWithBalance } from '@/types';
import type { AccountType, NormalBalance } from '@prisma/client';

export async function listAccounts(): Promise<AccountWithBalance[]> {
  const accounts = await prisma.account.findMany({ orderBy: { name: 'asc' } });
  return Promise.all(
    accounts.map(async (account) => {
      const balance = await computeBalance(account.id);
      return {
        ...account,
        balance: balance.toNumber(),
        created_at: account.created_at.toISOString(),
        updated_at: account.updated_at.toISOString(),
      };
    })
  );
}

export async function getAccountById(id: string): Promise<AccountWithBalance | null> {
  const account = await prisma.account.findFirst({ where: { id } });
  if (!account) return null;
  const balance = await computeBalance(id);
  return {
    ...account,
    balance: balance.toNumber(),
    created_at: account.created_at.toISOString(),
    updated_at: account.updated_at.toISOString(),
  };
}

export async function createAccount(data: {
  name: string;
  type: AccountType;
  normal_balance: NormalBalance;
  currency: string;
}) {
  return prisma.account.create({ data });
}

export async function updateAccount(id: string, data: Partial<{
  name: string;
  type: AccountType;
  normal_balance: NormalBalance;
  currency: string;
}>) {
  return prisma.account.update({ where: { id }, data });
}

export async function softDeleteAccount(id: string) {
  return prisma.account.update({ where: { id }, data: { deleted_at: new Date() } });
}
