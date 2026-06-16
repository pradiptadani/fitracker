import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentMonth } from '@/lib/utils';

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? getCurrentMonth();
  const record = await prisma.monthlySummary.findFirst({
    where: { month: new Date(`${month}-01T00:00:00Z`) },
  });
  if (!record)
    return NextResponse.json({ error: 'No summary for this month' }, { status: 404 });
  return NextResponse.json({
    data: {
      advice: record.ai_advice_given ?? null,
      payload: record.payload_json,
    },
  });
}
