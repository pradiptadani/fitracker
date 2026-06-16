import { CategoryChart as SharedCategoryChart } from '@/components/reports/category-chart';

export function CategoryChart(props: React.ComponentProps<typeof SharedCategoryChart>) {
  return <SharedCategoryChart {...props} />;
}
