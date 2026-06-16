import { BudgetBars as SharedBudgetBars } from '@/components/reports/budget-bars';

export function BudgetBar(props: React.ComponentProps<typeof SharedBudgetBars>) {
  return <SharedBudgetBars {...props} />;
}
