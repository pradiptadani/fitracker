'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIDR } from '@/lib/utils';

interface MonthlyOverviewProps {
  income: number;
  expenses: number;
  netCashflow: number;
  savingsRate: number;
}

export function MonthlyOverview({ income, expenses, netCashflow, savingsRate }: MonthlyOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="text-xl font-bold text-income">{formatIDR(income)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="text-xl font-bold text-expense">{formatIDR(expenses)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Net Cashflow</p>
          <p className="text-xl font-bold">{formatIDR(netCashflow)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Savings Rate</p>
          <p className="text-xl font-bold">{savingsRate.toFixed(1)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
