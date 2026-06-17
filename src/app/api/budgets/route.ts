import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { createBudgetSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const budgets = await prisma.budget.findMany({
    include: { category: { select: { id: true, name: true, type: true } } },
    orderBy: { start_date: "desc" },
  });
  return NextResponse.json({
    data: budgets.map((b) => ({ ...b, amount: Number(b.amount) })),
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = createBudgetSchema.parse(body);
    const budget = await prisma.budget.create({
      data,
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    return NextResponse.json(
      { data: { ...budget, amount: Number(budget.amount) } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    logger.error("API Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
