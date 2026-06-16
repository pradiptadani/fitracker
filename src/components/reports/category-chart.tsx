'use client';

import { formatIDR } from '@/lib/utils';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface CategoryChartProps {
  data: Array<Record<string, unknown>>;
}

export function CategoryChart({ data }: CategoryChartProps) {
  const points = data
    .map((row) => ({
      name: String(row.category_name ?? row.categoryName ?? '—'),
      total: Number(row.total ?? row.amount ?? 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (points.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No category data yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={points} layout="vertical" margin={{ top: 5, right: 16, left: 24, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}jt`} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) =>
            formatIDR(
              Number(value ?? 0)
            )
          }
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
