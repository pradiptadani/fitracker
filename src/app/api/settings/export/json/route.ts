import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { exportBackupJson } from '@/lib/export/json';

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const data = await exportBackupJson();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="fitracker-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
