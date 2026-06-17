import { describe, it, expect, vi } from 'vitest';
import { categorizeTransactionsBatch } from '@/lib/ai/categorize';
import { callLLM } from '@/lib/ai/client';

vi.mock('@/lib/ai/client', () => ({
  callLLM: vi.fn(),
}));

describe('AI Categorizer Batch', () => {
  it('should return valid JSON array suggestion', async () => {
    vi.mocked(callLLM).mockResolvedValue(
      '[{"categoryId":"uuid-123","categoryName":"Food","confidence":0.95,"reason":"Clear"}]'
    );

    const result = await categorizeTransactionsBatch(
      [{ amount: 50000, currency: 'IDR', date: '2026-04-18', accountName: 'BCA', accountType: 'ASSET' }],
      [{ id: 'uuid-123', name: 'Food', type: 'EXPENSE' }]
    );

    expect(result.length).toBe(1);
    expect(result[0]!.categoryId).toBe('uuid-123');
    expect(result[0]!.confidence).toBe(0.95);
  });
});
