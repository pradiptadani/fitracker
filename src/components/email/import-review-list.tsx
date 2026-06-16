'use client';

import type { EmailExtractResult } from '@/types';
import { ImportCard } from './import-card';

interface ImportReviewListProps {
  items: EmailExtractResult[];
  onAccept: (item: EmailExtractResult) => void;
  onReject: (item: EmailExtractResult) => void;
}

export function ImportReviewList({ items, onAccept, onReject }: ImportReviewListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No email imports to review.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <ImportCard
          key={item.providerMessageId || index}
          email={item}
          onAccept={() => onAccept(item)}
          onReject={() => onReject(item)}
        />
      ))}
    </div>
  );
}
