import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/services/settings";

const schema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const data = await getAllSettings();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { key, value } = schema.parse(body);
    await setSetting(key, value);
    return NextResponse.json({ data: { key, value } });
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
