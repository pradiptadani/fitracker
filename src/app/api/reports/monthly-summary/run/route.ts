import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { runMonthlySummary } from '@/lib/services/monthly-summary';
import { getCurrentMonth } from '@/lib/utils';

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? getCurrentMonth();
  try {
    const result = await runMonthlySummary(month);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
