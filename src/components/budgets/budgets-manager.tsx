'use client';

import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudgetProgress, useCreateBudget, useDeleteBudget } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { formatIDR, getCurrentMonth } from '@/lib/utils';

function lastDayOfMonth(month: string): Date {
  const start = new Date(`${month}-01T00:00:00`);
  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
}

export function BudgetsManager() {
  const month = getCurrentMonth();
  const { data: budgets = [], isLoading } = useBudgetProgress(month);
  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  async function submit() {
    if (!categoryId || !amount) return;
    await createBudget.mutateAsync({
      category_id: categoryId,
      amount: Number(amount),
      period: 'monthly',
      start_date: new Date(`${month}-01`),
      end_date: lastDayOfMonth(month),
    });
    setAmount('');
    setCategoryId('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Track monthly budget progress by expense category."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add budget</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={submit} disabled={!categoryId || !amount || createBudget.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget progress ({month})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <LoadingState rows={3} />
          ) : budgets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No budgets for {month}. Add one above.
            </p>
          ) : (
            budgets.map((b) => (
              <div key={b.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{b.category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatIDR(b.actual)} of {formatIDR(b.amount)} · {b.status}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBudget.mutate(b.id)}
                    aria-label={`Delete ${b.category.name} budget`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(Math.abs(b.variancePercent), 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
