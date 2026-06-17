import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { computeBalance } from "@/lib/balance";
import { createAccountSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const accounts = await prisma.account.findMany({ orderBy: { name: "asc" } });
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => {
      const balance = await computeBalance(account.id);
      return { ...account, balance: balance.toNumber() };
    }),
  );
  return NextResponse.json({ data: accountsWithBalances });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = createAccountSchema.parse(body);
    const account = await prisma.account.create({ data });
    return NextResponse.json({ data: account }, { status: 201 });
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
