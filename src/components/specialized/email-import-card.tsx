import { MailCheck, MailWarning, ReceiptText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIDR } from '@/lib/utils';
import type { EmailExtractResult } from '@/types';

interface EmailImportCardProps {
  result?: EmailExtractResult | null;
}

export function EmailImportCard({ result }: EmailImportCardProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MailCheck className="h-5 w-5" />
            Email import
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Paste bank or e-wallet email snippets to extract amount, merchant, account hint, reference, and transaction type.
        </CardContent>
      </Card>
    );
  }

  const confidenceTone = result.confidence >= 0.7 ? 'text-income' : result.confidence >= 0.5 ? 'text-transfer' : 'text-expense';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ReceiptText className="h-5 w-5" />
          Parsed email transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-semibold">{result.amount === null ? 'Unknown' : formatIDR(result.amount)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className={`text-xl font-semibold ${confidenceTone}`}>{Math.round(result.confidence * 100)}%</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Merchant" value={result.merchant} />
          <Detail label="Account hint" value={result.accountHint} />
          <Detail label="Type" value={result.suggestedType} />
          <Detail label="Date" value={result.transactionDate} />
          <Detail label="Reference" value={result.referenceNumber} />
          <Detail label="Sender" value={result.sender} />
        </div>

        {result.confidence < 0.5 ? (
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
