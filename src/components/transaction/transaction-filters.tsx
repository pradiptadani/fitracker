'use client';

import { useQueryState } from 'nuqs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionFiltersProps {
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const [q, setQ] = useQueryState('q', { defaultValue: '' });
  const [accountId, setAccountId] = useQueryState('accountId', { defaultValue: 'all' });
  const [categoryId, setCategoryId] = useQueryState('categoryId', { defaultValue: 'all' });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-md border">
      <div className="flex-1 max-w-sm">
        <Input
          placeholder="Search notes/merchant..."
          value={q}
          onChange={(e) => setQ(e.target.value || null)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={accountId} onValueChange={(val) => setAccountId(val === 'all' ? null : val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={(val) => setCategoryId(val === 'all' ? null : val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
