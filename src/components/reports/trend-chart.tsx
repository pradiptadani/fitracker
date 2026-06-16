'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrendChartProps {
  data: Array<Record<string, unknown>>;
}

export function TrendChart({ data }: TrendChartProps) {
  const points = data.map((row) => ({
    month: String(row.month ?? ''),
    income: Number(row.income ?? 0),
    expenses: Number(row.expenses ?? 0),
    net: Number(row.net ?? 0),
  }));

  if (points.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No cashflow data yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={points} margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}jt`} />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
              Number(value ?? 0)
            )
          }
        />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
