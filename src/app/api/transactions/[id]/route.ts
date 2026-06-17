import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const transaction = await prisma.transaction.findFirst({
    where: { id },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, type: true } },
    },
  });
  if (!transaction)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    data: {
      ...transaction,
      amount: Number(transaction.amount),
      exchange_rate: Number(transaction.exchange_rate),
      is_transfer: transaction.transfer_group_id !== null,
    },
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
    const data = updateTransactionSchema.parse(body);
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });
    return NextResponse.json({
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        exchange_rate: Number(transaction.exchange_rate),
        is_transfer: transaction.transfer_group_id !== null,
      },
    });
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  // If it's a transfer, soft-delete both legs
  const tx = await prisma.transaction.findFirst({ where: { id } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (tx.transfer_group_id) {
    await prisma.transaction.updateMany({
      where: { transfer_group_id: tx.transfer_group_id },
      data: { deleted_at: new Date() },
    });
  } else {
    await prisma.transaction.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
  return NextResponse.json({ data: { success: true } });
}
