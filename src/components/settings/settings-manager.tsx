'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';

const AI_CATEGORIZER_KEY = 'aiCategorizerEnabled';
const AI_ADVICE_KEY = 'aiMonthlyAdviceEnabled';

export function SettingsManager() {
  const { data: settings = {}, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();

  const [currency, setCurrency] = useState(() =>
    String(settings.defaultCurrency ?? 'IDR')
  );
  const [aiCategorizer, setAiCategorizer] = useState<boolean>(
    settings[AI_CATEGORIZER_KEY] !== false
  );
  const [aiAdvice, setAiAdvice] = useState<boolean>(
    settings[AI_ADVICE_KEY] !== false
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSavedAt(null);
    try {
      await updateSetting.mutateAsync({ key: 'defaultCurrency', value: currency });
      await updateSetting.mutateAsync({ key: AI_CATEGORIZER_KEY, value: aiCategorizer });
      await updateSetting.mutateAsync({ key: AI_ADVICE_KEY, value: aiAdvice });
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure defaults, exports, and automation."
      />

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <LoadingState rows={2} />
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default currency</Label>
                <Input
                  id="default-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">AI categorizer</p>
                  <p className="text-sm text-muted-foreground">
                    Suggest a category for uncategorized transactions.
                  </p>
                </div>
                <Switch checked={aiCategorizer} onCheckedChange={setAiCategorizer} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">AI monthly advice</p>
                  <p className="text-sm text-muted-foreground">
                    Generate advice when running the monthly summary.
                  </p>
                </div>
                <Switch checked={aiAdvice} onCheckedChange={setAiAdvice} />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save settings
                </Button>
                {savedAt ? (
                  <span className="text-sm text-muted-foreground">Saved at {savedAt}</span>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href="/api/settings/export/json">JSON backup</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/settings/export/csv">CSV transactions</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
