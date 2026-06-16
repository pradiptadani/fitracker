import prisma from '@/lib/prisma';
import { Decimal } from 'decimal.js';

/**
 * Compute the true balance of an account using the polarity-aware SQL.
 * 
 * - Assets & Expenses (normal_balance = debit): debits increase, credits decrease
 * - Liabilities, Equity, Income (normal_balance = credit): credits increase, debits decrease
 * 
 * Balance is NEVER stored on the Account — always computed from Transaction history.
 */
export async function computeBalance(accountId: string): Promise<Decimal> {
  const result = await prisma.$queryRaw<{ true_balance: Decimal | null }[]>`
    SELECT SUM(
      CASE
        WHEN a.normal_balance = 'debit'
          THEN CASE WHEN t.type = 'debit' THEN t.amount ELSE -t.amount END
        ELSE
          CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END
      END
    ) AS true_balance
    FROM "Transaction" t
    JOIN "Account" a ON t.account_id = a.id
    WHERE t.deleted_at IS NULL
      AND a.deleted_at IS NULL
      AND a.id = ${accountId}
  `;

  const balance = result[0]?.true_balance;
  return balance ? new Decimal(balance.toString()) : new Decimal(0);
}
