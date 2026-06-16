import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { computeBalance } from "@/lib/balance";
import { updateAccountSchema } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const account = await prisma.account.findFirst({ where: { id } });
  if (!account)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const balance = await computeBalance(id);
  return NextResponse.json({
    data: { ...account, balance: balance.toNumber() },
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
    const data = updateAccountSchema.parse(body);
    const account = await prisma.account.update({ where: { id }, data });
    return NextResponse.json({ data: account });
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
  await prisma.account.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
  return NextResponse.json({ data: { success: true } });
}
