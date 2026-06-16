import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { categorizeTransaction } from "@/lib/ai/categorize";
import prisma from "@/lib/prisma";

const schema = z.object({
  transaction_id: z.string().uuid(),
});

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { allowed, retryAfterMs } = checkRateLimit();
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterMs },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { transaction_id } = schema.parse(body);

    const transaction = await prisma.transaction.findFirst({
      where: { id: transaction_id },
      include: { account: true },
    });
    if (!transaction)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const suggestion = await categorizeTransaction(
      {
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date: transaction.date.toISOString().slice(0, 10),
        notes: transaction.notes,
        accountName: transaction.account.name,
        accountType: transaction.account.type,
      },
      categories,
    );

    if (!suggestion) {
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ data: suggestion });
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
