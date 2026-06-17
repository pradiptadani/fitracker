import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

const schema = z.object({ category_id: z.string().uuid() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  try {
    const body = await request.json();
    const { category_id } = schema.parse(body);
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { category_id },
    });
    return NextResponse.json({
      data: { ...transaction, amount: Number(transaction.amount) },
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
