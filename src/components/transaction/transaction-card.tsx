import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Repeat2 } from 'lucide-react';
import type { TransactionWithRelations } from '@/types';
import { formatDate, formatIDR } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TransactionCardProps {
  transaction: TransactionWithRelations;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isCredit = transaction.type === 'credit';
  return (
    <Link
      href={`/transactions/${transaction.id}`}
      className="grid gap-3 rounded-md p-4 transition-colors hover:bg-muted/40 md:grid-cols-[1fr_160px_160px] md:items-center border mb-2 bg-card"
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 ${
            isCredit ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
          }`}
        >
          {transaction.is_transfer ? (
            <Repeat2 className="h-4 w-4" />
          ) : isCredit ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownLeft className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {transaction.notes || transaction.category?.name || 'Uncategorized'}
            </p>
            {transaction.is_transfer ? <Badge variant="outline">Transfer</Badge> : null}
            {!transaction.category && !transaction.is_transfer ? (
              <Badge variant="destructive">Uncategorized</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {transaction.account.name} · {transaction.category?.name ?? 'No category'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
        <CalendarDays className="h-4 w-4" />
        {formatDate(transaction.date)}
      </div>

      <div className="text-left md:text-right">
        <p className={`font-semibold ${isCredit ? 'text-income' : 'text-expense'}`}>
          {isCredit ? '+' : '-'}
          {formatIDR(Number(transaction.amount))}
        </p>
        <p className="text-xs text-muted-foreground">{transaction.currency}</p>
      </div>
    </Link>
  );
}
