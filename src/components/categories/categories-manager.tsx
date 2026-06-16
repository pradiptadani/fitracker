'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/use-categories';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';

type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER_FEE';

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('EXPENSE');

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createCategory.mutateAsync({ name: trimmed, type, parent_category_id: null });
    setName('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Create spending, income, and fee categories."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="TRANSFER_FEE">Transfer fee</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={submit} disabled={createCategory.isPending || !name.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <LoadingState rows={4} />
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteCategory.mutate(c.id)}
                  aria-label={`Delete ${c.name}`}
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
