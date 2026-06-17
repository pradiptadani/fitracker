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

const PROMPT_HEADER = `You are a transaction categorizer for a personal finance app.\nUser is in Jakarta, Indonesia. Primary currency is IDR.`;


export function parseCategorizeResponse(raw: string): string {
  let jsonStr = raw;
  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
  }
  return jsonStr;
}

export function buildCategorizePrompt(
  transaction: TransactionInput,
  categories: CategoryOption[]
): string {
  const categoryList = categories.map(c => `${c.id} | ${c.name} (${c.type})`).join('\n');
  return `${PROMPT_HEADER}

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
    const jsonStr = parseCategorizeResponse(raw);
    const parsed = JSON.parse(jsonStr) as { categoryId: string; categoryName: string; confidence: number; reason: string };
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

  return `${PROMPT_HEADER}

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

  // Warning 5: cap batch size to 50
  if (transactions.length > 50) {
    const results: (AISuggestion | null)[] = [];
    for (let i = 0; i < transactions.length; i += 50) {
      const chunk = transactions.slice(i, i + 50);
      const chunkResults = await categorizeTransactionsBatch(chunk, categories);
      results.push(...chunkResults);
    }
    return results;
  }

  const model =
    process.env.AI_CATEGORIZER_MODEL ??
    process.env.OPENROUTER_MODEL ??
    'google/gemini-2.0-flash-001';
  const prompt = buildCategorizeBatchPrompt(transactions, categories);

  // Warning 1: maxTokens based on length
  const maxTokens = Math.max(1024, transactions.length * 200);

  let raw = '';
  try {
    raw = await callLLM({ model, prompt, maxTokens, temperature: 0.1, timeout: 30_000 });
  } catch (err) {
    console.error('LLM API call failed:', err);
    return transactions.map(() => null);
  }

  try {
    const jsonStr = parseCategorizeResponse(raw);

    // Warning 2: Try parsing array, if fails completely, we map null
    let parsed = JSON.parse(jsonStr) as { categoryId: string; categoryName: string; confidence: number; reason: string }[];

    // Warning 3: validate length
    if (!Array.isArray(parsed) || parsed.length !== transactions.length) {
      console.warn(`LLM returned ${Array.isArray(parsed) ? parsed.length : 'non-array'} suggestions for ${transactions.length} txs`);
      // If we have some, we can pad/truncate to exactly transactions.length
      if (!Array.isArray(parsed)) {
        parsed = [];
      }
    }

    const validCategoryIds = new Set(categories.map(c => c.id));

    return transactions.map((_, i) => {
      const p = parsed[i];
      if (!p) return null;

      // Warning 4: Validate categoryId against list
      if (!validCategoryIds.has(p.categoryId)) {
         return null;
      }

      return {
        categoryId: p.categoryId,
        categoryName: p.categoryName || '',
        confidence: p.confidence ?? 0,
        reason: p.reason || '',
      };
    });
  } catch (err) {
    console.error('Failed to parse batch LLM response:', err);
    // Warning 2: silent parse failure wastes entire batch - we return null for all as fallback if total JSON syntax error.
    // If it was partial JSON, unfortunately JSON.parse fails entirely. We'd need a robust partial parser which is complex.
    // We will stick to returning nulls for the batch on complete JSON.parse failure.
    return transactions.map(() => null);
  }
}
