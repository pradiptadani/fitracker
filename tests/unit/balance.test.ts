import { describe, it, expect, vi } from 'vitest';
import { computeBalance } from '@/lib/balance';

// Mock Prisma
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      $queryRaw: vi.fn(),
    },
  };
});

import prisma from '@/lib/prisma';
import { Decimal } from 'decimal.js';

describe('Balance Calculation', () => {
  it('should calculate balance correctly based on normal balance', async () => {
    const mockBalance = [{ true_balance: '1500000.00' }];
    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockBalance);

    const balance = await computeBalance('dummy-id');
    expect(balance.toNumber()).toBe(1500000);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('should handle accounts with no transactions', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ true_balance: null }]);

    const balance = await computeBalance('dummy-id');
    expect(balance.toNumber()).toBe(0);
  });
});
