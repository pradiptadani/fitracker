import prisma from '@/lib/prisma';
import { Decimal } from 'decimal.js';
import { randomUUID } from 'crypto';

/**
 * Create a transfer between two accounts.
 * 
 * This always creates TWO linked Transaction rows inside a single
 * prisma.$transaction() call:
 * - Source account: type = 'credit' (decreases asset)
 * - Destination account: type = 'debit' (increases asset)
 * 
 * Both rows share the same transfer_group_id UUID.
 * Transfers are excluded from P&L calculations.
 */
export async function createTransfer(
  sourceId: string,
  destId: string,
  amount: Decimal | number | string,
  date: Date,
  notes?: string,
) {
  const transferAmount = new Decimal(amount.toString());
  const groupId = randomUUID();

  const [sourceTransaction, destTransaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        account_id: sourceId,
        amount: transferAmount,
        type: 'credit',
        transfer_group_id: groupId,
        date,
        notes: notes ?? `Transfer to destination`,
      },
    }),
    prisma.transaction.create({
      data: {
        account_id: destId,
        amount: transferAmount,
        type: 'debit',
        transfer_group_id: groupId,
        date,
        notes: notes ?? `Transfer from source`,
      },
    }),
  ]);

  return { sourceTransaction, destTransaction, groupId };
}
