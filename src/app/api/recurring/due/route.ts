import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const now = new Date();
  const rows = await prisma.recurringTransaction.findMany({
    where: { active: true, next_due: { lte: now } },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { next_due: 'asc' },
  });
  return NextResponse.json({ data: rows.map(r => ({ ...r, amount: Number(r.amount) })) });
}
