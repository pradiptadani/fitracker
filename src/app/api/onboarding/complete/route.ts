import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { completeOnboarding } from '@/lib/services/onboarding';

export async function POST() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  await completeOnboarding();
  return NextResponse.json({ data: { success: true } });
}
