import { ErrorBoundary } from '@/components/shared/error-boundary';
import { RecurringManager } from '@/components/recurring/recurring-manager';

export default function RecurringPage() {
  return (
    <ErrorBoundary>
      <RecurringManager />
    </ErrorBoundary>
  );
}
