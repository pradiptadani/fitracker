import prisma from '@/lib/prisma';

export async function listRecurring() {
  const rows = await prisma.recurringTransaction.findMany({
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { next_due: 'asc' },
  });
  return rows.map(r => ({ ...r, amount: Number(r.amount) }));
}

export async function listDueRecurring() {
  const rows = await prisma.recurringTransaction.findMany({
    where: { active: true, next_due: { lte: new Date() } },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { next_due: 'asc' },
  });
  return rows.map(r => ({ ...r, amount: Number(r.amount) }));
}

export function advanceNextDue(date: Date, frequency: string, dayOfMonth?: number | null): Date {
  const next = new Date(date);
  if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    if (dayOfMonth) next.setDate(Math.min(dayOfMonth, 28));
  } else if (frequency === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export async function acceptRecurring(id: string) {
  const recurring = await prisma.recurringTransaction.findFirst({ where: { id, active: true } });
  if (!recurring) return null;

  const nextDue = advanceNextDue(recurring.next_due, recurring.frequency, recurring.day_of_month);

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        account_id: recurring.account_id,
        amount: recurring.amount,
        currency: recurring.currency,
        type: recurring.type,
        category_id: recurring.category_id,
        date: recurring.next_due,
        notes: recurring.notes ?? recurring.name,
      },
    }),
    prisma.recurringTransaction.update({
      where: { id },
      data: { last_generated: new Date(), next_due: nextDue },
    }),
  ]);

  return { transaction: { ...transaction, amount: Number(transaction.amount) }, nextDue };
}
