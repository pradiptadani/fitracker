'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/page-header';
import { EmailImportCard } from '@/components/specialized/email-import-card';
import { apiData, jsonRequest } from '@/hooks/api-client';
import type { EmailExtractResult } from '@/types';

export function EmailImportsManager() {
  const [snippet, setSnippet] = useState('');
  const [result, setResult] = useState<EmailExtractResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function parse() {
    if (!snippet) return;
    setLoading(true);
    try {
      const data = await apiData<EmailExtractResult>(
        '/api/email/parse',
        jsonRequest('POST', {
          sender: 'manual-import@local',
          subject: 'Manual import',
          received_at: new Date().toISOString(),
          snippet,
        })
      );
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Imports"
        description="Paste bank or e-wallet email text, then extract transaction fields."
      />

      <Card>
        <CardHeader>
          <CardTitle>Parse email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="min-h-48"
            placeholder="Paste email body or receipt snippet..."
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
          />
          <Button onClick={parse} disabled={!snippet || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Parse
          </Button>
        </CardContent>
      </Card>

      {result ? <EmailImportCard result={result} /> : null}
    </div>
  );
}
