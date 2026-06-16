import prisma from '@/lib/prisma';
import { getMonthlyReport } from '@/lib/services/reports';
import { getSetting } from '@/lib/services/settings';
import { generateMonthlyAdvice } from '@/lib/ai/monthly-advice';
import type { AIAdvice, MonthlySummaryPayload } from '@/types';

/**
 * Run (or re-run) the monthly summary for a given month (YYYY-MM).
 *
 * Behaviour:
 * 1. Compute the MonthlySummaryPayload via getMonthlyReport.
 * 2. Upsert the MonthlySummary row (update if exists for this month, else create).
 * 3. If the row has no `ai_advice_given` AND the `aiMonthlyAdviceEnabled`
 *    setting is true (default) AND the month has any activity
 *    (income + expenses > 0), call generateMonthlyAdvice using the last
 *    3 stored summaries and persist the result on the row.
 *
 * Returns the row id, the month, and the advice payload (null if not
 * generated in this run).
 */
export async function runMonthlySummary(
  month: string,
): Promise<{ id: string; month: string; advice: AIAdvice | null }> {
  const payload = await getMonthlyReport(month);

  const existing = await prisma.monthlySummary.findFirst({
    where: { month: new Date(`${month}-01T00:00:00Z`) },
  });

  const data = {
    total_income: payload.totalIncome,
    total_expenses: payload.totalExpenses,
    payload_json: payload as unknown as Parameters<
      typeof prisma.monthlySummary.create
    >[0]['data']['payload_json'],
  };

  const row = existing
    ? await prisma.monthlySummary.update({ where: { id: existing.id }, data })
    : await prisma.monthlySummary.create({
        data: { month: new Date(`${month}-01T00:00:00Z`), ...data },
      });

  // Generate advice only on first run, when enabled, and when the month has data.
  if (row.ai_advice_given) {
    return { id: row.id, month, advice: null };
  }
  if (payload.totalIncome + payload.totalExpenses <= 0) {
    return { id: row.id, month, advice: null };
  }
  const enabled = (await getSetting('aiMonthlyAdviceEnabled')) !== false;
  if (!enabled) {
    return { id: row.id, month, advice: null };
  }

  const summaries = await getLastSummaries(3);
  const advice = await generateMonthlyAdvice(summaries);

  const updated = await prisma.monthlySummary.update({
    where: { id: row.id },
    data: { ai_advice_given: JSON.stringify(advice) },
  });

  return {
    id: updated.id,
    month,
    advice: (() => {
      try {
        return JSON.parse(updated.ai_advice_given ?? '{}') as AIAdvice;
      } catch {
        return null;
      }
    })(),
  };
}

export async function getLastSummaries(
  count: number = 3,
): Promise<MonthlySummaryPayload[]> {
  const records = await prisma.monthlySummary.findMany({
    orderBy: { month: 'desc' },
    take: count,
  });
  return records.map((r) => r.payload_json as unknown as MonthlySummaryPayload);
}
