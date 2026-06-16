'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryPickerProps {
  categories: { id: string; name: string; type: string }[];
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function CategoryPicker({ categories, value, onChange, disabled }: CategoryPickerProps) {
  return (
    <Select
      value={value || 'none'}
      onValueChange={(val) => onChange(val === 'none' ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select category (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Uncategorized</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name} ({cat.type})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
