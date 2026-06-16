import { callLLM } from '@/lib/ai/client';
import { formatIDR } from '@/lib/utils';
import type { AIAdvice, MonthlySummaryPayload } from '@/types';

export function buildAdvicePrompt(summaries: MonthlySummaryPayload[]): string {
  const summariesText = summaries.map(s => `
## ${s.month}
- Income: ${formatIDR(s.totalIncome)}
- Expenses: ${formatIDR(s.totalExpenses)}
- Net: ${formatIDR(s.netCashflow)}
- Savings Rate: ${s.savingsRate.toFixed(1)}%
- Top Categories: ${s.categoryBreakdown.slice(0, 5).map(c => `${c.categoryName}: ${formatIDR(c.amount)}`).join(', ')}
- Budget Overruns: ${s.budgetVariance.filter(b => b.variancePercent > 0).map(b => `${b.categoryName}: +${b.variancePercent.toFixed(0)}%`).join(', ') || 'none'}
`).join('\n');

  return `You are a personal finance advisor for a user in Jakarta, Indonesia.
Primary currency is IDR. Income is often irregular (freelance/gig).

Analyze the last ${summaries.length} months:
${summariesText}

Respond in JSON only:
{"summary":"2-3 sentence overview","wins":["positive 1","positive 2"],"risks":["concern 1","concern 2"],"recommendations":["action 1","action 2","action 3"],"nextMonthFocus":["category 1","category 2"]}

Rules:
- Be specific with IDR amounts
- Reference actual numbers
- Keep advice practical
- Consider Indonesian context (e-wallets, irregular income)
- Never fabricate data`;
}

export async function generateMonthlyAdvice(summaries: MonthlySummaryPayload[]): Promise<AIAdvice> {
  const model =
    process.env.AI_ADVICE_MODEL ??
    process.env.OPENROUTER_MODEL ??
    'anthropic/claude-sonnet-4';
  const prompt = buildAdvicePrompt(summaries);
  const raw = await callLLM({ model, prompt, maxTokens: 1024, temperature: 0.3, timeout: 30_000 });

  try {
    return JSON.parse(raw) as AIAdvice;
  } catch {
    return {
      summary: raw,
      wins: [],
      risks: [],
      recommendations: [],
      nextMonthFocus: [],
    };
  }
}
