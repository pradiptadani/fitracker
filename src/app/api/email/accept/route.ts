import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { markEmailProcessed } from "@/lib/email/dedup";

const schema = z.object({
  account_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default("IDR"),
  type: z.enum(["debit", "credit"]),
  category_id: z.string().uuid().optional().nullable(),
  date: z.coerce.date(),
  notes: z.string().optional().nullable(),
  provider_message_id: z.string().optional(),
});

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const transaction = await prisma.transaction.create({
      data: {
        account_id: data.account_id,
        amount: data.amount,
        currency: data.currency,
        type: data.type,
        category_id: data.category_id ?? null,
        date: data.date,
        notes: data.notes ?? null,
      },
    });

    if (data.provider_message_id) {
      await markEmailProcessed(data.provider_message_id);
    }

    return NextResponse.json(
      { data: { ...transaction, amount: Number(transaction.amount) } },
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
