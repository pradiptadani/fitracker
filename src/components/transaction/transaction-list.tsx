import type { TransactionWithRelations } from '@/types';
import { TransactionCard } from './transaction-card';
import { EmptyState } from '@/components/shared/empty-state';

interface TransactionListProps {
  transactions: TransactionWithRelations[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return <EmptyState title="No transactions" description="No transactions found for this period." />;
  }

  return (
    <div className="space-y-1">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
