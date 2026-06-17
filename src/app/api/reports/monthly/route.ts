import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { getMonthlyReport } from '@/lib/services/reports';
import { getCurrentMonth } from '@/lib/utils';
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? getCurrentMonth();
  try {
    const data = await getMonthlyReport(month);
    return NextResponse.json({ data });
  } catch (error) {
    logger.error("API Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
