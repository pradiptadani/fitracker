import prisma from "@/lib/prisma";
import { getMonthRange } from "@/lib/utils";
import type { BudgetWithProgress } from "@/types";

export async function getBudgetProgress(
  month: string,
): Promise<BudgetWithProgress[]> {
  const { start, end } = getMonthRange(month);

  const budgets = await prisma.budget.findMany({
    where: {
      start_date: { lte: end },
      end_date: { gte: start },
    },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });

  return Promise.all(
    budgets.map(async (b) => {
      const rows = await prisma.$queryRaw<{ total: number }[]>`
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
      const actual = rows[0]?.total ?? 0;
      const budgetAmount = Number(b.amount);
      const variance = actual - budgetAmount;
      const variancePercent =
        budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
      const status: "under" | "near" | "over" =
        actual >= budgetAmount
          ? "over"
          : actual >= budgetAmount * 0.8
            ? "near"
            : "under";

      return {
        id: b.id,
        category_id: b.category_id,
        amount: budgetAmount,
        period: b.period,
        start_date: b.start_date.toISOString(),
        end_date: b.end_date.toISOString(),
        category: {
          id: b.category.id,
          name: b.category.name,
          type: b.category.type,
        },
        actual,
        variance,
        variancePercent,
        status,
      };
    }),
  );
}

export async function listBudgets() {
  const rows = await prisma.budget.findMany({
    include: { category: { select: { id: true, name: true, type: true } } },
    orderBy: { start_date: "desc" },
  });
  return rows.map((b) => ({ ...b, amount: Number(b.amount) }));
}

export async function createBudget(data: {
  category_id: string;
  amount: number;
  period: string;
  start_date: Date;
  end_date: Date;
}) {
  const budget = await prisma.budget.create({
    data,
    include: { category: { select: { id: true, name: true, type: true } } },
  });
  return { ...budget, amount: Number(budget.amount) };
}

export async function softDeleteBudget(id: string) {
  return prisma.budget.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}
