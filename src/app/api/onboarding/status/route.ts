import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth';
import { getOnboardingStatus } from '@/lib/services/onboarding';

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const data = await getOnboardingStatus();
  return NextResponse.json({ data });
}
