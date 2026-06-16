import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

const CreateTransactionSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('IDR'),
  exchange_rate: z.number().positive().default(1),
  type: z.enum(['debit', 'credit']),
  category_id: z.string().uuid().optional(),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { deleted_at: null },
    include: {
      account: { select: { name: true, type: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
    take: 50,
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = CreateTransactionSchema.parse(body);

    const transaction = await prisma.transaction.create({
      data: {
        account_id: data.account_id,
        amount: data.amount,
        currency: data.currency,
        exchange_rate: data.exchange_rate,
        type: data.type,
        category_id: data.category_id,
        date: new Date(data.date),
        notes: data.notes,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
