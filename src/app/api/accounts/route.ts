import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import type { Account } from '@prisma/client';
import { getSession } from '@/lib/session';
import { computeBalance } from '@/lib/balance';

const CreateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']),
  normal_balance: z.enum(['debit', 'credit']),
  currency: z.string().default('IDR'),
});

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { deleted_at: null },
    orderBy: { name: 'asc' },
  });

  // Compute balance for each account
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account: Account) => {
      const balance = await computeBalance(account.id);
      return {
        ...account,
        balance: balance.toString(),
      };
    })
  );

  return NextResponse.json(accountsWithBalances);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = CreateAccountSchema.parse(body);

    const account = await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        normal_balance: data.normal_balance,
        currency: data.currency,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
