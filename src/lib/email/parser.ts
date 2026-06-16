import type { EmailExtractResult } from '@/types';

const AMOUNT_PATTERNS = [
  /(?:Rp|IDR)\s*([\d.,]+)/i,
  /([\d.,]+)\s*(?:IDR)/i,
];

const DATE_PATTERNS = [
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
  /(\d{4}[\/\-]\d{2}[\/\-]\d{2})/,
];

function parseAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/\./g, '').replace(',', '.');
      const num = parseFloat(raw);
      return isNaN(num) ? null : num;
    }
  }
  return null;
}

function parseDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectType(subject: string, snippet: string): EmailExtractResult['suggestedType'] {
  const lower = (subject + ' ' + snippet).toLowerCase();
  if (lower.includes('transfer') || lower.includes('kirim')) return 'transfer';
  if (lower.includes('kredit') || lower.includes('masuk') || lower.includes('received')) return 'income';
  if (lower.includes('debit') || lower.includes('keluar') || lower.includes('payment') || lower.includes('pembelian')) return 'expense';
  return 'unknown';
}

export function parseEmailSnippet(input: {
  sender: string;
  subject: string;
  receivedAt: string;
  snippet: string;
  providerMessageId?: string;
}): EmailExtractResult {
  const { sender, subject, snippet, receivedAt, providerMessageId } = input;
  const fullText = subject + ' ' + snippet;

  const amount = parseAmount(fullText);
  const transactionDate = parseDate(fullText);
  const suggestedType = detectType(subject, snippet);

  // Detect account hint from sender domain
  const senderLower = sender.toLowerCase();
  let accountHint: string | null = null;
  if (senderLower.includes('bca')) accountHint = 'BCA';
  else if (senderLower.includes('mandiri')) accountHint = 'Mandiri';
  else if (senderLower.includes('gopay') || senderLower.includes('gojek')) accountHint = 'GoPay';
  else if (senderLower.includes('ovo')) accountHint = 'OVO';
  else if (senderLower.includes('dana')) accountHint = 'Dana';

  // Extract merchant (simple heuristic)
  const merchantMatch = fullText.match(/(?:di|at|merchant|toko)\s*:\s*([A-Za-z\s]{2,30})/i) || fullText.match(/(?:di|at|merchant|toko)\s+([A-Z][a-zA-Z\s]{2,30})/);
  const merchant = merchantMatch ? merchantMatch[1].trim() : null;

  // Reference number
  const refMatch = fullText.match(/(?:ref|no\.?|trx|order)\s*[:#]?\s*([A-Z0-9]{6,20})/i);
  const referenceNumber = refMatch ? refMatch[1] : null;

  const confidence = amount !== null ? 0.7 : 0.3;

  return {
    providerMessageId,
    sender,
    subject,
    receivedAt,
    merchant,
    amount,
    currency: 'IDR',
    transactionDate,
    accountHint,
    paymentMethodHint: accountHint,
    referenceNumber,
    suggestedType,
    suggestedCategoryName: null,
    confidence,
    rawSnippet: snippet,
  };
}
