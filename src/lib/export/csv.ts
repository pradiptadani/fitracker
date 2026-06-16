import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export async function exportTransactionsCsv(): Promise<string> {
  const transactions = await prisma.transaction.findMany({
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  });

  const header = 'Date,Account,Category,Type,Amount,Currency,Notes,Transfer\n';
  const rows = transactions.map(t => {
    const date = formatDate(t.date);
    const account = t.account.name;
    const category = t.category?.name ?? '';
    const type = t.type;
    const amount = Number(t.amount).toFixed(0);
    const currency = t.currency;
    const notes = `"${(t.notes ?? '').replace(/"/g, '""')}"`;
    const isTransfer = t.transfer_group_id ? 'true' : 'false';
    return `${date},${account},${category},${type},${amount},${currency},${notes},${isTransfer}`;
  });

  return header + rows.join('\n');
}
