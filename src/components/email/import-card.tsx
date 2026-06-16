'use client';

import { MailWarning, ReceiptText, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatIDR } from '@/lib/utils';
import type { EmailExtractResult } from '@/types';

interface ImportCardProps {
  email: EmailExtractResult;
  onAccept: () => void;
  onReject: () => void;
}

export function ImportCard({ email, onAccept, onReject }: ImportCardProps) {
  const confidenceTone = email.confidence >= 0.7 ? 'text-income' : email.confidence >= 0.5 ? 'text-transfer' : 'text-expense';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ReceiptText className="h-5 w-5" />
          Parsed email transaction
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={onReject}>
            <X className="h-4 w-4 mr-1" /> Dismiss
          </Button>
          <Button size="sm" onClick={onAccept}>
            <Check className="h-4 w-4 mr-1" /> Accept
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-semibold">{email.amount === null ? 'Unknown' : formatIDR(email.amount)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className={`text-xl font-semibold ${confidenceTone}`}>{Math.round(email.confidence * 100)}%</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Merchant" value={email.merchant} />
          <Detail label="Account hint" value={email.accountHint} />
          <Detail label="Type" value={email.suggestedType} />
          <Detail label="Date" value={email.transactionDate} />
          <Detail label="Reference" value={email.referenceNumber} />
          <Detail label="Sender" value={email.sender} />
        </div>

        {email.confidence < 0.5 ? (
          <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <MailWarning className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Low confidence. Review raw snippet before creating transaction.</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value ?? 'Not found'}</p>
    </div>
  );
}
