'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccountPickerProps {
  accounts: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AccountPicker({ accounts, value, onChange, disabled }: AccountPickerProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((acc) => (
          <SelectItem key={acc.id} value={acc.id}>
            {acc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
