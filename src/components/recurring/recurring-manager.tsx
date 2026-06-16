'use client';

import { useState } from 'react';
import { Check, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import {
  useAcceptRecurring,
  useCreateRecurring,
  useDeleteRecurring,
  useDueRecurringTransactions,
  useRecurringTransactions,
} from '@/hooks/use-recurring';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { formatDate, formatIDR } from '@/lib/utils';

type Frequency = 'weekly' | 'monthly' | 'yearly';
type TxType = 'debit' | 'credit';

interface FormState {
  name: string;
  account_id: string;
  category_id: string;
  amount: string;
  type: TxType;
  frequency: Frequency;
  next_due: string;
}

export function RecurringManager() {
  const { data: recurring = [], isLoading } = useRecurringTransactions();
  const { data: due = [] } = useDueRecurringTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createRecurring = useCreateRecurring();
  const deleteRecurring = useDeleteRecurring();
  const acceptRecurring = useAcceptRecurring();

  const [form, setForm] = useState<FormState>({
    name: '',
    account_id: '',
    category_id: '',
    amount: '',
    type: 'debit',
    frequency: 'monthly',
    next_due: new Date().toISOString().slice(0, 10),
  });

  async function submit() {
    if (!form.name || !form.account_id || !form.amount) return;
    await createRecurring.mutateAsync({
      name: form.name,
      account_id: form.account_id,
      amount: Number(form.amount),
      currency: 'IDR',
      type: form.type,
      category_id: form.category_id || null,
      notes: null,
      frequency: form.frequency,
      day_of_month: null,
      next_due: new Date(form.next_due),
    });
    setForm({ ...form, name: '', amount: '' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring"
        description="Manage bills, subscriptions, payroll, and other repeats."
      />

      {due.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Due now ({due.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {due.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 p-3"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatIDR(r.amount)} · due {formatDate(r.next_due)} · {r.account.name}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => acceptRecurring.mutate(r.id)}
                  disabled={acceptRecurring.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add recurring transaction</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            type="date"
            value={form.next_due}
            onChange={(e) => setForm({ ...form, next_due: e.target.value })}
          />
          <Select
            value={form.account_id}
            onValueChange={(v) => setForm({ ...form, account_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.category_id}
            onValueChange={(v) => setForm({ ...form, category_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.frequency}
            onValueChange={(v) => setForm({ ...form, frequency: v as Frequency })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v as TxType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">Expense (debit)</SelectItem>
              <SelectItem value="credit">Income (credit)</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:col-span-3">
            <Button
              onClick={submit}
              disabled={
                !form.name || !form.account_id || !form.amount || createRecurring.isPending
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled ({recurring.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <LoadingState rows={3} />
          ) : recurring.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recurring rules yet.</p>
          ) : (
            recurring.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatIDR(r.amount)} · {r.frequency} · next {formatDate(r.next_due)} ·{' '}
                    {r.account.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRecurring.mutate(r.id)}
                  aria-label={`Delete ${r.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
