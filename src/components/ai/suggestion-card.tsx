'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './confidence-badge';
import type { AISuggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onAccept: () => void;
  onReject?: () => void;
}

export function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">AI Category Suggestion</CardTitle>
        <ConfidenceBadge confidence={suggestion.confidence} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-lg font-semibold">{suggestion.categoryName}</p>
          <CardDescription className="mt-1">{suggestion.reason}</CardDescription>
        </div>
        <div className="flex gap-2 justify-end">
          {onReject ? (
            <Button variant="outline" size="sm" onClick={onReject}>
              Dismiss
            </Button>
          ) : null}
          <Button size="sm" onClick={onAccept}>
            Apply Category
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
