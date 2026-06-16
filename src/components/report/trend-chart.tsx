import { TrendChart as SharedTrendChart } from '@/components/reports/trend-chart';

export function TrendChart(props: React.ComponentProps<typeof SharedTrendChart>) {
  return <SharedTrendChart {...props} />;
}
