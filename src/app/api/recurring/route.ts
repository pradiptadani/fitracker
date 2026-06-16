import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { createRecurringSchema } from "@/lib/validators";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const rows = await prisma.recurringTransaction.findMany({
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { next_due: "asc" },
  });
  return NextResponse.json({
    data: rows.map((r) => ({ ...r, amount: Number(r.amount) })),
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = createRecurringSchema.parse(body);
    const row = await prisma.recurringTransaction.create({
      data,
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });
    return NextResponse.json(
      { data: { ...row, amount: Number(row.amount) } },
      { status: 201 },
    );
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
