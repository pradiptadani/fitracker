import { describe, it, expect, vi } from 'vitest';
import { createTransfer } from '@/lib/services/transfers';

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: vi.fn(),
    transaction: {
      create: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';

describe('Transfer Execution', () => {
  it('should create two rows within a transaction', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([
      { id: '1', type: 'credit', amount: 50000 },
      { id: '2', type: 'debit', amount: 50000 },
    ]);

    const result = await createTransfer({
      source_account_id: 'acc1',
      destination_account_id: 'acc2',
      amount: 50000,
      currency: 'IDR',
      exchange_rate: 1,
      date: new Date(),
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.transactions.length).toBe(2);
  });
});
