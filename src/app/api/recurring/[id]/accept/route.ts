import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { acceptRecurring } from '@/lib/services/recurring';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const { id } = await params;

  const result = await acceptRecurring(id);
  if (!result) {
    return NextResponse.json(
      { error: 'Recurring rule not found or inactive' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: result }, { status: 201 });
}
