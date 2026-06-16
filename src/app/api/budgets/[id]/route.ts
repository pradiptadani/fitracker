import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { updateBudgetSchema } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const budget = await prisma.budget.findFirst({
    where: { id },
    include: { category: { select: { id: true, name: true, type: true } } },
  });
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    data: { ...budget, amount: Number(budget.amount) },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  try {
    const body = await request.json();
    const data = updateBudgetSchema.parse(body);
    const budget = await prisma.budget.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    return NextResponse.json({
      data: { ...budget, amount: Number(budget.amount) },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  await prisma.budget.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
  return NextResponse.json({ data: { success: true } });
}
