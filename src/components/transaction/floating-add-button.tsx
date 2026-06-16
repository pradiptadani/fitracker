'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TransactionForm } from './transaction-form';

import type { TransactionOption, TransactionCategoryOption, TransactionSubmitValues } from './types';

interface FloatingAddButtonProps {
  accounts: TransactionOption[];
  categories: TransactionCategoryOption[];
  onSubmit: (values: TransactionSubmitValues) => Promise<void> | void;
}

export function FloatingAddButton({ accounts, categories, onSubmit }: FloatingAddButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogTitle>Add Transaction</DialogTitle>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={async (vals) => {
              await onSubmit(vals);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
