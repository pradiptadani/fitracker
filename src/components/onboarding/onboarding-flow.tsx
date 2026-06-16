import { OnboardingChecklist as SharedOnboardingChecklist } from '@/components/specialized/onboarding-checklist';

export function OnboardingFlow(props: React.ComponentProps<typeof SharedOnboardingChecklist>) {
  return <SharedOnboardingChecklist {...props} />;
}
