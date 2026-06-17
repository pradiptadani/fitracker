import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { createTransactionSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const accountId = url.searchParams.get("account") ?? undefined;
  const categoryId = url.searchParams.get("category") ?? undefined;
  const from = url.searchParams.get("from")
    ? new Date(url.searchParams.get("from")!)
    : undefined;
  const to = url.searchParams.get("to")
    ? new Date(url.searchParams.get("to")!)
    : undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const transferOnly = url.searchParams.get("transfers") === "true";

  const transactions = await prisma.transaction.findMany({
    where: {
      account_id: accountId,
      category_id: categoryId,
      date: from || to ? { gte: from, lte: to } : undefined,
      notes: search ? { contains: search, mode: "insensitive" } : undefined,
      transfer_group_id: transferOnly ? { not: null } : undefined,
    },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { date: "desc" },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });

  const hasMore = transactions.length > limit;
  if (hasMore) transactions.pop();
  const nextCursor = hasMore
    ? (transactions[transactions.length - 1]?.id ?? null)
    : null;

  const data = transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    exchange_rate: Number(t.exchange_rate),
    is_transfer: t.transfer_group_id !== null,
  }));

  return NextResponse.json({ data, nextCursor, hasMore });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = createTransactionSchema.parse(body);
    const transaction = await prisma.transaction.create({
      data: {
        account_id: data.account_id,
        amount: data.amount,
        currency: data.currency,
        exchange_rate: data.exchange_rate,
        type: data.type,
        category_id: data.category_id ?? null,
        date: data.date,
        notes: data.notes ?? null,
      },
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });
    return NextResponse.json(
      {
        data: {
          ...transaction,
          amount: Number(transaction.amount),
          exchange_rate: Number(transaction.exchange_rate),
          is_transfer: false,
        },
      },
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
