import { getSetting, setSetting } from '@/lib/services/settings';

export async function getOnboardingStatus(): Promise<{ completed: boolean }> {
  const raw = await getSetting('onboarding_completed');
  if (raw && typeof raw === 'object' && 'completed' in (raw as object)) {
    return raw as { completed: boolean };
  }
  return { completed: false };
}

export async function completeOnboarding(): Promise<void> {
  await setSetting('onboarding_completed', { completed: true });
}
