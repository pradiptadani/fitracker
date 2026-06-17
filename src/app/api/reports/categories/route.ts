import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { getCategoryBreakdown } from '@/lib/services/reports';
import { getCurrentMonth, getMonthRange } from '@/lib/utils';
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? getCurrentMonth();
  const type = (url.searchParams.get('type') ?? 'EXPENSE') as 'INCOME' | 'EXPENSE';
  const { start, end } = getMonthRange(month);
  try {
    const data = await getCategoryBreakdown({ start, end }, type);
    return NextResponse.json({ data });
  } catch (error) {
    logger.error("API Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
