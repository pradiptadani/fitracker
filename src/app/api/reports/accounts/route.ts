import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { listAccounts } from '@/lib/services/accounts';
import { logger } from "@/lib/logger";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const data = await listAccounts();
    return NextResponse.json({ data });
  } catch (error) {
    logger.error("API Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
