import { describe, it, expect } from 'vitest';
import { parseEmailSnippet } from '@/lib/email/parser';

describe('Email Parser', () => {
  it('should extract amount and merchant from GoPay receipt', () => {
    const emailData = {
      sender: 'receipts@gojek.com',
      subject: 'Pembayaran Berhasil!',
      receivedAt: '2026-04-18T10:00:00Z',
      snippet: `
        Tanggal: 18 April 2026
        Merchant: Kopi Kenangan
        Total Pembayaran: Rp 25.000
      `
    };

    const result = parseEmailSnippet(emailData);
    expect(result.amount).toBe(25000);
    expect(result.merchant).toContain('Kopi Kenangan');
  });
});
