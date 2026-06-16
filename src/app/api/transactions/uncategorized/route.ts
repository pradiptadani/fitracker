import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const transactions = await prisma.transaction.findMany({
    where: { category_id: null, transfer_group_id: null },
    include: { account: { select: { id: true, name: true, type: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  });
  return NextResponse.json({
    data: transactions.map(t => ({
      ...t,
      amount: Number(t.amount),
      exchange_rate: Number(t.exchange_rate),
    })),
  });
}
