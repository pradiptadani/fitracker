'use client';

interface MonthSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  return (
    <input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  );
}
