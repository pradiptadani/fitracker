import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth";
import { createTransferSchema } from "@/lib/validators";
import { createTransfer } from "@/lib/services/transfers";

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = createTransferSchema.parse(body);
    const result = await createTransfer({
      source_account_id: data.source_account_id,
      destination_account_id: data.destination_account_id,
      amount: data.amount,
      currency: data.currency,
      exchange_rate: data.exchange_rate,
      date: data.date,
      notes: data.notes ?? null,
      fee: data.fee
        ? {
            amount: data.fee.amount,
            account_id: data.fee.account_id,
            category_id: data.fee.category_id,
            notes: data.fee.notes ?? null,
          }
        : undefined,
    });
    return NextResponse.json({ data: result }, { status: 201 });
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
