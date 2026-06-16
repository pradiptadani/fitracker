import { StatCard as SharedStatCard } from '@/components/shared/stat-card';

export function StatCard(props: React.ComponentProps<typeof SharedStatCard>) {
  return <SharedStatCard {...props} />;
}
