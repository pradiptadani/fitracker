'use client';

import { useFormContext } from 'react-hook-form';
import { Receipt } from 'lucide-react';
import { useTemplateStore } from '@/stores/template-store';
import { Button } from '@/components/ui/button';
import { formatIDR } from '@/lib/utils';
import type { TransactionFormValues } from './types';

const MAX_CHIPS = 5;

export function TemplateChips() {
  const form = useFormContext<TransactionFormValues>();
  const templates = useTemplateStore((s) => s.templates);
  const recordUse = useTemplateStore((s) => s.recordTemplateUse);

  if (templates.length === 0) return null;

  const top = [...templates]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, MAX_CHIPS);

  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    form.reset({
      accountId: template.account_id,
      amount: template.amount,
      currency: template.currency,
      exchangeRate: form.getValues('exchangeRate') || 1,
      type: template.type === 'income' ? 'credit' : 'debit',
      categoryId: template.category_id,
      date: form.getValues('date') || new Date().toISOString().slice(0, 10),
      notes: template.notes || '',
    });
    recordUse(templateId);
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Receipt className="h-3 w-3" />
        From templates
      </p>
      <div className="flex flex-wrap gap-1.5">
        {top.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => applyTemplate(template.id)}
          >
            {template.name}
            <span className="ml-1.5 text-muted-foreground">
              {formatIDR(template.amount)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
