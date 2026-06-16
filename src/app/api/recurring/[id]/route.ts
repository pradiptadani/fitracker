import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { updateRecurringSchema } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const row = await prisma.recurringTransaction.findFirst({
    where: { id },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: { ...row, amount: Number(row.amount) } });
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
    const data = updateRecurringSchema.parse(body);
    const row = await prisma.recurringTransaction.update({
      where: { id },
      data,
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });
    return NextResponse.json({ data: { ...row, amount: Number(row.amount) } });
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
  await prisma.recurringTransaction.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
  return NextResponse.json({ data: { success: true } });
}
