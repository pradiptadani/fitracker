import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validators";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const categories = await prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = createCategorySchema.parse(body);
    const category = await prisma.category.create({ data });
    return NextResponse.json({ data: category }, { status: 201 });
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
