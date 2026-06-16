import { Bot, CheckCircle2, Lightbulb, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AIAdvice, AISuggestion } from '@/types';

interface AIInsightsProps {
  advice?: AIAdvice | null;
  suggestion?: AISuggestion | null;
}

export function AIInsights({ advice, suggestion }: AIInsightsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            Monthly AI advice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {advice ? (
            <>
              <p className="text-sm text-muted-foreground">{advice.summary}</p>
              <InsightList title="Wins" items={advice.wins} icon={CheckCircle2} tone="text-income" />
              <InsightList title="Risks" items={advice.risks} icon={ShieldAlert} tone="text-expense" />
              <InsightList title="Recommendations" items={advice.recommendations} icon={Lightbulb} tone="text-transfer" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run monthly summary advice to see AI guidance based on income, expenses, budgets, and balances.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category suggestion</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestion ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Suggested category</p>
                <p className="text-2xl font-semibold">{suggestion.categoryName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${suggestion.confidence * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round(suggestion.confidence * 100)}%</p>
              </div>
              <p className="rounded-lg bg-muted p-3 text-sm">{suggestion.reason}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ask AI to classify uncategorized transactions, then review confidence before accepting.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InsightList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
