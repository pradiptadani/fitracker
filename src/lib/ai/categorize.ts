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
