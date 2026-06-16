'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAccount } from '@/hooks/use-accounts';

type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
type NormalBalance = 'debit' | 'credit';

const DEFAULT_NORMAL_BY_TYPE: Record<AccountType, NormalBalance> = {
  ASSET: 'debit',
  EXPENSE: 'debit',
  LIABILITY: 'credit',
  EQUITY: 'credit',
  INCOME: 'credit',
};

export function NewAccountButton() {
  const router = useRouter();
  const create = useCreateAccount();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('ASSET');
  const [normalBalance, setNormalBalance] = useState<NormalBalance>('debit');
  const [currency, setCurrency] = useState('IDR');

  function pickType(next: AccountType) {
    setType(next);
    setNormalBalance(DEFAULT_NORMAL_BY_TYPE[next]);
  }

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await create.mutateAsync({
        name: trimmed,
        type,
        normal_balance: normalBalance,
        currency: currency.toUpperCase(),
      });
      toast.success('Account created');
      setOpen(false);
      setName('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New account</DialogTitle>
          <DialogDescription>
            Add a cash, bank, e-wallet, or credit account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              placeholder="BCA, GoPay, Credit Card..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => pickType(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSET">Asset</SelectItem>
                  <SelectItem value="LIABILITY">Liability</SelectItem>
                  <SelectItem value="EQUITY">Equity</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Normal balance</Label>
              <Select value={normalBalance} onValueChange={(v) => setNormalBalance(v as NormalBalance)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-currency">Currency</Label>
            <Input
              id="account-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </div>
          <Button
            onClick={submit}
            disabled={!name.trim() || create.isPending}
            className="w-full"
          >
            {create.isPending ? 'Creating…' : 'Create account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
