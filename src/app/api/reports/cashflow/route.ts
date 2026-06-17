import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { getCashflow } from '@/lib/services/reports';
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const months = parseInt(url.searchParams.get('months') ?? '6');
  try {
    const data = await getCashflow(Math.min(months, 24));
    return NextResponse.json({ data });
  } catch (error) {
    logger.error("API Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
