import prisma from '@/lib/prisma';
import { getMonthRange } from '@/lib/utils';
import type { MonthlySummaryPayload } from '@/types';

export interface PeriodFilter {
  start: Date;
  end: Date;
}

export async function getIncomeTotal(period: PeriodFilter): Promise<number> {
  const result = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(t.amount * t.exchange_rate), 0)::float AS total
    FROM "Transaction" t
    JOIN "Account" a ON t.account_id = a.id
    LEFT JOIN "Category" c ON t.category_id = c.id
    WHERE t.deleted_at IS NULL
      AND a.deleted_at IS NULL
      AND t.transfer_group_id IS NULL
      AND c.type = 'INCOME'
      AND t.date >= ${period.start}
      AND t.date < ${period.end}
  `;
  return result[0]?.total ?? 0;
}

export async function getExpenseTotal(period: PeriodFilter): Promise<number> {
  const result = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(t.amount * t.exchange_rate), 0)::float AS total
    FROM "Transaction" t
    JOIN "Account" a ON t.account_id = a.id
    LEFT JOIN "Category" c ON t.category_id = c.id
    WHERE t.deleted_at IS NULL
      AND a.deleted_at IS NULL
      AND t.transfer_group_id IS NULL
      AND c.type IN ('EXPENSE', 'TRANSFER_FEE')
      AND t.date >= ${period.start}
      AND t.date < ${period.end}
  `;
  return result[0]?.total ?? 0;
}

export async function getCategoryBreakdown(
  period: PeriodFilter,
  categoryType: 'INCOME' | 'EXPENSE',
) {
  const rows = await prisma.$queryRaw<
    { category_id: string; category_name: string; total: number }[]
  >`
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      COALESCE(SUM(t.amount * t.exchange_rate), 0)::float AS total
    FROM "Transaction" t
    JOIN "Account" a ON t.account_id = a.id
    LEFT JOIN "Category" c ON t.category_id = c.id
    WHERE t.deleted_at IS NULL
      AND a.deleted_at IS NULL
      AND t.transfer_group_id IS NULL
      AND c.type = ${categoryType}::"CategoryType"
      AND t.date >= ${period.start}
      AND t.date < ${period.end}
    GROUP BY c.id, c.name
    ORDER BY total DESC
  `;
  return rows;
}

export async function getCashflow(months: number = 6) {
  const result: { month: string; income: number; expenses: number; net: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toISOString().slice(0, 7);
    const { start, end } = getMonthRange(month);

    const income = await getIncomeTotal({ start, end });
    const expenses = await getExpenseTotal({ start, end });
    result.push({ month, income, expenses, net: income - expenses });
  }
  return result;
}

export async function getMonthlyReport(month: string): Promise<MonthlySummaryPayload> {
  const { start, end } = getMonthRange(month);

  const totalIncome = await getIncomeTotal({ start, end });
  const totalExpenses = await getExpenseTotal({ start, end });
  const netCashflow = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const categoryBreakdownRaw = await getCategoryBreakdown({ start, end }, 'EXPENSE');
  const totalExpensesForPct = categoryBreakdownRaw.reduce((s, r) => s + r.total, 0);
  const categoryBreakdown = categoryBreakdownRaw.map((r) => ({
    categoryId: r.category_id,
    categoryName: r.category_name,
    amount: r.total,
    percentageOfExpenses:
      totalExpensesForPct > 0 ? (r.total / totalExpensesForPct) * 100 : 0,
    monthOverMonthDelta: 0, // TODO: compute against previous month
  }));

  // Budget variance
  const budgets = await prisma.budget.findMany({
    where: { start_date: { lte: end }, end_date: { gte: start } },
    include: { category: true },
  });
  const budgetVariance = await Promise.all(
    budgets.map(async (b) => {
      const actual = await prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(t.amount * t.exchange_rate), 0)::float AS total
        FROM "Transaction" t
        JOIN "Account" a ON t.account_id = a.id
        WHERE t.deleted_at IS NULL
          AND a.deleted_at IS NULL
          AND t.transfer_group_id IS NULL
          AND t.category_id = ${b.category_id}
          AND t.date >= ${start}
          AND t.date < ${end}
      `;
      const actualAmount = actual[0]?.total ?? 0;
      const budgetAmount = Number(b.amount);
      const varianceAmount = actualAmount - budgetAmount;
      const variancePercent =
        budgetAmount > 0 ? (varianceAmount / budgetAmount) * 100 : 0;
      return {
        categoryId: b.category_id,
        categoryName: b.category.name,
        budgetAmount,
        actualAmount,
        varianceAmount,
        variancePercent,
      };
    }),
  );

  // Account balances
  const accounts = await prisma.account.findMany({ orderBy: { name: 'asc' } });
  const { computeBalance } = await import('@/lib/balance');
  const accountBalances = await Promise.all(
    accounts.map(async (a) => ({
      accountId: a.id,
      accountName: a.name,
      type: a.type,
      balanceIdr: (await computeBalance(a.id)).toNumber(),
    })),
  );

  return {
    month,
    currency: 'IDR',
    totalIncome,
    totalExpenses,
    netCashflow,
    savingsRate,
    categoryBreakdown,
    budgetVariance,
    accountBalances,
    trends: {
      incomeMoMPercent: 0,
      expenseMoMPercent: 0,
      netCashflowMoMPercent: 0,
    },
  };
}
