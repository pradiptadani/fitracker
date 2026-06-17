import { describe, it, expect, vi } from 'vitest';
import { categorizeTransactionsBatch, parseCategorizeResponse } from '@/lib/ai/categorize';
import { callLLM } from '@/lib/ai/client';

vi.mock('@/lib/ai/client', () => ({
  callLLM: vi.fn(),
}));

describe('AI Categorizer Batch Edge Cases', () => {
  const transactions = [
    { amount: 50000, currency: 'IDR', date: '2026-04-18', accountName: 'BCA', accountType: 'ASSET' },
    { amount: 20000, currency: 'IDR', date: '2026-04-19', accountName: 'BCA', accountType: 'ASSET' }
  ];
  const categories = [
    { id: 'uuid-123', name: 'Food', type: 'EXPENSE' }
  ];

  it('should return empty array for empty input', async () => {
    const result = await categorizeTransactionsBatch([], categories);
    expect(result).toEqual([]);
    expect(callLLM).not.toHaveBeenCalled();
  });

  it('should handle malformed JSON returning nulls', async () => {
    vi.mocked(callLLM).mockResolvedValueOnce('Not JSON');
    const result = await categorizeTransactionsBatch(transactions, categories);
    expect(result).toEqual([null, null]);
  });

  it('should handle length mismatch by padding with nulls', async () => {
    // Returns only 1 result for 2 inputs
    vi.mocked(callLLM).mockResolvedValueOnce(
      '[{"categoryId":"uuid-123","categoryName":"Food","confidence":0.95,"reason":"Clear"}]'
    );
    const result = await categorizeTransactionsBatch(transactions, categories);
    expect(result.length).toBe(2);
    expect(result[0]!.categoryId).toBe('uuid-123');
    expect(result[1]).toBeNull();
  });

  it('should invalidate wrong categoryId', async () => {
    vi.mocked(callLLM).mockResolvedValueOnce(
      '[{"categoryId":"wrong-id","categoryName":"Food","confidence":0.95,"reason":"Clear"}, {"categoryId":"uuid-123","categoryName":"Food","confidence":0.95,"reason":"Clear"}]'
    );
    const result = await categorizeTransactionsBatch(transactions, categories);
    expect(result[0]).toBeNull();
    expect(result[1]!.categoryId).toBe('uuid-123');
  });

  it('should handle missing fields safely', async () => {
    vi.mocked(callLLM).mockResolvedValueOnce(
      '[{"categoryId":"uuid-123"}, {"categoryId":"uuid-123"}]'
    );
    const result = await categorizeTransactionsBatch(transactions, categories);
    expect(result[0]!.categoryId).toBe('uuid-123');
    expect(result[0]!.categoryName).toBe('');
    expect(result[0]!.confidence).toBe(0);
  });
});

describe('parseCategorizeResponse', () => {
  it('strips json code fences', () => {
    expect(parseCategorizeResponse('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it('strips plain code fences', () => {
    expect(parseCategorizeResponse('```\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it('leaves raw text alone if no fences', () => {
    expect(parseCategorizeResponse('{"a":1}')).toBe('{"a":1}');
  });
});
