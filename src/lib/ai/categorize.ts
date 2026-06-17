import { callLLM } from '@/lib/ai/client';
import type { AISuggestion } from '@/types';

interface TransactionInput {
  amount: number;
  currency: string;
  date: string;
  notes?: string | null;
  accountName: string;
  accountType: string;
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

export function buildCategorizePrompt(
  transaction: TransactionInput,
  categories: CategoryOption[]
): string {
  const categoryList = categories.map(c => `${c.id} | ${c.name} (${c.type})`).join('\n');
  return `You are a transaction categorizer for a personal finance app.
User is in Jakarta, Indonesia. Primary currency is IDR.

Assign exactly ONE category from the list below.

Transaction:
- Amount: ${transaction.amount} ${transaction.currency}
- Date: ${transaction.date}
- Account: ${transaction.accountName} (${transaction.accountType})
- Notes: ${transaction.notes || 'none'}

Available categories (id | name | type):
${categoryList}

Rules:
- Pick ONLY from the provided list
- If unsure, return confidence below 0.5
- Return JSON only

Respond:
{"categoryId":"uuid","categoryName":"name","confidence":0.0,"reason":"one sentence"}`;
}

export async function categorizeTransaction(
  transaction: TransactionInput,
  categories: CategoryOption[]
): Promise<AISuggestion | null> {
  const model =
    process.env.AI_CATEGORIZER_MODEL ??
    process.env.OPENROUTER_MODEL ??
    'google/gemini-2.0-flash-001';
  const prompt = buildCategorizePrompt(transaction, categories);

  const raw = await callLLM({ model, prompt, maxTokens: 256, temperature: 0.1, timeout: 15_000 });

  try {
    const parsed = JSON.parse(raw) as { categoryId: string; categoryName: string; confidence: number; reason: string };
    return {
      categoryId: parsed.categoryId,
      categoryName: parsed.categoryName,
      confidence: parsed.confidence,
      reason: parsed.reason,
    };
  } catch {
    return null;
  }
}

export function buildCategorizeBatchPrompt(
  transactions: TransactionInput[],
  categories: CategoryOption[]
): string {
  const categoryList = categories.map(c => `${c.id} | ${c.name} (${c.type})`).join('\n');
  const transactionList = transactions.map((t, i) => `[ID: ${i}]
- Amount: ${t.amount} ${t.currency}
- Date: ${t.date}
- Account: ${t.accountName} (${t.accountType})
- Notes: ${t.notes || 'none'}`).join('\n\n');

  return `You are a transaction categorizer for a personal finance app.
User is in Jakarta, Indonesia. Primary currency is IDR.

Assign exactly ONE category from the list below to each transaction.

Transactions:
${transactionList}

Available categories (id | name | type):
${categoryList}

Rules:
- Pick ONLY from the provided list
- If unsure, return confidence below 0.5
- Return a JSON array only, in the same order as the transactions provided

Respond ONLY with a JSON array:
[
  {"categoryId":"uuid","categoryName":"name","confidence":0.0,"reason":"one sentence"}
]`;
}

export async function categorizeTransactionsBatch(
  transactions: TransactionInput[],
  categories: CategoryOption[]
): Promise<(AISuggestion | null)[]> {
  if (transactions.length === 0) return [];

  const model =
    process.env.AI_CATEGORIZER_MODEL ??
    process.env.OPENROUTER_MODEL ??
    'google/gemini-2.0-flash-001';
  const prompt = buildCategorizeBatchPrompt(transactions, categories);

  const raw = await callLLM({ model, prompt, maxTokens: 1024, temperature: 0.1, timeout: 30_000 });

  try {
    let jsonStr = raw;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(jsonStr) as { categoryId: string; categoryName: string; confidence: number; reason: string }[];
    return parsed.map(p => ({
      categoryId: p?.categoryId ?? '',
      categoryName: p?.categoryName ?? '',
      confidence: p?.confidence ?? 0,
      reason: p?.reason ?? '',
    }));
  } catch (err) {
    console.error('Failed to parse batch LLM response:', err);
    return transactions.map(() => null);
  }
}
