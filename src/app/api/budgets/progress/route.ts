import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { getBudgetProgress } from '@/lib/services/budgets';

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? new Date().toISOString().slice(0, 7);
  const data = await getBudgetProgress(month);
  return NextResponse.json({ data });
}
