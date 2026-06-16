import { CheckCircle2, Circle, WalletCards } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  completed: boolean;
  steps?: OnboardingStep[];
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'accounts',
    title: 'Create accounts',
    description: 'Add cash, bank, e-wallet, and credit accounts.',
    completed: false,
  },
  {
    id: 'categories',
    title: 'Review categories',
    description: 'Keep default income and expense categories or adjust them.',
    completed: false,
  },
  {
    id: 'transactions',
    title: 'Add first transaction',
    description: 'Record income, expense, or transfer to verify balances.',
    completed: false,
  },
  {
    id: 'budgets',
    title: 'Set monthly budgets',
    description: 'Track category limits and variance alerts.',
    completed: false,
  },
];

export function OnboardingChecklist({ completed, steps = defaultSteps }: OnboardingChecklistProps) {
  const resolvedSteps = completed ? steps.map((step) => ({ ...step, completed: true })) : steps;
  const doneCount = resolvedSteps.filter((step) => step.completed).length;
  const progress = resolvedSteps.length > 0 ? (doneCount / resolvedSteps.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <WalletCards className="h-5 w-5" />
          Onboarding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Setup progress</span>
            <span className="font-medium">{doneCount}/{resolvedSteps.length}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {resolvedSteps.map((step) => {
            const Icon = step.completed ? CheckCircle2 : Circle;
            return (
              <div key={step.id} className="flex gap-3 rounded-lg border p-3">
                <Icon className={step.completed ? 'mt-0.5 h-5 w-5 text-income' : 'mt-0.5 h-5 w-5 text-muted-foreground'} />
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
