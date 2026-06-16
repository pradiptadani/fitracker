import * as React from 'react';
import { Input } from '@/components/ui/input';

interface AmountInputProps extends React.ComponentProps<'input'> {
  value: number;
  onChangeAmount: (val: number) => void;
  currency?: string;
}

export function AmountInput({ value, onChangeAmount, currency = 'IDR', ...props }: AmountInputProps) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-sm font-semibold text-muted-foreground">{currency}</span>
      <Input
        type="number"
        className="pl-12 font-semibold text-lg"
        value={value || ''}
        onChange={(e) => onChangeAmount(Number(e.target.value))}
        placeholder="0"
        {...props}
      />
    </div>
  );
}
