import { Badge } from '@/components/ui/badge';

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  const variant = confidence >= 0.8 ? 'default' : confidence >= 0.5 ? 'secondary' : 'destructive';

  return (
    <Badge variant={variant}>
      {percentage}% match
    </Badge>
  );
}
