'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateTransaction } from '@/hooks/use-transactions';
import type { TransactionWithRelations } from '@/types';

interface TransactionEditFormProps {
  transaction: TransactionWithRelations;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: 'INCOME' | 'EXPENSE' | 'TRANSFER_FEE' }>;
}

export function TransactionEditForm({ transaction, accounts, categories }: TransactionEditFormProps) {
  const router = useRouter();
  const update = useUpdateTransaction(transaction.id);
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [categoryId, setCategoryId] = useState<string | null>(transaction.category_id);
  const [date, setDate] = useState(transaction.date.slice(0, 10));
  const [notes, setNotes] = useState(transaction.notes ?? '');

  const compatibleCategories = transaction.type === 'credit'
    ? categories.filter((c) => c.type === 'INCOME')
    : categories.filter((c) => c.type === 'EXPENSE');

  async function submit() {
    try {
      await update.mutateAsync({
        account_id: accountId,
        category_id: categoryId,
        date: new Date(date),
        notes: notes.trim() || null,
      });
      toast.success('Transaction updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Account</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={categoryId ?? 'none'}
            onValueChange={(v) => setCategoryId(v === 'none' ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Uncategorized" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Uncategorized</SelectItem>
              {compatibleCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            maxLength={500}
          />
        </div>
      </div>

      <Button onClick={submit} disabled={update.isPending}>
        {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save changes
      </Button>
    </div>
  );
}
