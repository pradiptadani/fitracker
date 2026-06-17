import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth";
import { emailParseSchema } from "@/lib/validators";
import { parseEmailSnippet } from "@/lib/email/parser";
import { isDuplicateEmail } from "@/lib/email/dedup";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const input = emailParseSchema.parse(body);

    if (input.provider_message_id) {
      const isDup = await isDuplicateEmail(input.provider_message_id);
      if (isDup) {
        return NextResponse.json(
          { error: "Duplicate message" },
          { status: 409 },
        );
      }
    }

    const result = parseEmailSnippet({
      sender: input.sender,
      subject: input.subject,
      receivedAt: input.received_at.toISOString(),
      snippet: input.snippet,
      providerMessageId: input.provider_message_id,
    });

    return NextResponse.json({ data: result });
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
