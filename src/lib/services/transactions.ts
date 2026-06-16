import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  from?: Date;
  to?: Date;
  search?: string;
  transferOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export async function listTransactions(filters: TransactionFilters = {}) {
  const limit = Math.min(filters.limit ?? 20, 100);
  const where: Prisma.TransactionWhereInput = {
    account_id: filters.accountId,
    category_id: filters.categoryId,
    date: (filters.from || filters.to) ? { gte: filters.from, lte: filters.to } : undefined,
    notes: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
    transfer_group_id: filters.transferOnly ? { not: null } : undefined,
  };

  const rows = await prisma.transaction.findMany({
    where,
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { date: 'desc' },
    take: limit + 1,
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : 0,
  });

  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();
  const nextCursor = hasMore ? rows[rows.length - 1]?.id ?? null : null;

  return {
    data: rows.map(t => ({
      ...t,
      amount: Number(t.amount),
      exchange_rate: Number(t.exchange_rate),
      is_transfer: t.transfer_group_id !== null,
    })),
    nextCursor,
    hasMore,
  };
}

export async function getTransactionById(id: string) {
  const t = await prisma.transaction.findFirst({
    where: { id },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, type: true } },
    },
  });
  if (!t) return null;
  return {
    ...t,
    amount: Number(t.amount),
    exchange_rate: Number(t.exchange_rate),
    is_transfer: t.transfer_group_id !== null,
  };
}

export async function softDeleteTransaction(id: string) {
  const tx = await prisma.transaction.findFirst({ where: { id } });
  if (!tx) return null;
  if (tx.transfer_group_id) {
    await prisma.transaction.updateMany({
      where: { transfer_group_id: tx.transfer_group_id },
      data: { deleted_at: new Date() },
    });
  } else {
    await prisma.transaction.update({ where: { id }, data: { deleted_at: new Date() } });
  }
  return { success: true };
}

export async function listUncategorized() {
  const rows = await prisma.transaction.findMany({
    where: { category_id: null, transfer_group_id: null },
    include: { account: { select: { id: true, name: true, type: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  });
  return rows.map(t => ({
    ...t,
    amount: Number(t.amount),
    exchange_rate: Number(t.exchange_rate),
  }));
}
