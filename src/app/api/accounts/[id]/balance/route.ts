import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { computeBalance } from '@/lib/balance';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const balance = await computeBalance(id);
  return NextResponse.json({ data: { balance: balance.toNumber() } });
}
