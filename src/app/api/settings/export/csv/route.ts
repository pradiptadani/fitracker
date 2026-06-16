import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { exportTransactionsCsv } from '@/lib/export/csv';

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const csv = await exportTransactionsCsv();
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
