import { describe, it, expect, vi } from 'vitest';
import { categorizeTransaction } from '@/lib/ai/categorize';
import { callLLM } from '@/lib/ai/client';

vi.mock('@/lib/ai/client', () => ({
  callLLM: vi.fn(),
}));

describe('AI Categorizer', () => {
  it('should return valid JSON suggestion', async () => {
    vi.mocked(callLLM).mockResolvedValue(
      '{"categoryId":"uuid-123","categoryName":"Food","confidence":0.95,"reason":"Clear"}'
    );

    const result = await categorizeTransaction(
      { amount: 50000, currency: 'IDR', date: '2026-04-18', accountName: 'BCA', accountType: 'ASSET' },
      [{ id: 'uuid-123', name: 'Food', type: 'EXPENSE' }]
    );

    expect(result!.categoryId).toBe('uuid-123');
    expect(result!.confidence).toBe(0.95);
  });
});
