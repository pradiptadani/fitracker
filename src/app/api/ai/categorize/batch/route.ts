import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ai/rate-limit';
import { categorizeTransaction } from '@/lib/ai/categorize';
import prisma from '@/lib/prisma';

export async function POST() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { allowed } = checkRateLimit();
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const uncategorized = await prisma.transaction.findMany({
    where: { category_id: null, transfer_group_id: null },
    include: { account: true },
    take: 10,
    orderBy: { date: 'desc' },
  });

  if (uncategorized.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  const results = await Promise.all(
    uncategorized.map(async (t) => {
      const suggestion = await categorizeTransaction(
        {
          amount: Number(t.amount),
          currency: t.currency,
          date: t.date.toISOString().slice(0, 10),
          notes: t.notes,
          accountName: t.account.name,
          accountType: t.account.type,
        },
        categories
      );
      return { transaction_id: t.id, suggestion };
    })
  );

  return NextResponse.json({ data: results });
}
