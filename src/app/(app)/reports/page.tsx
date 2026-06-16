import { ErrorBoundary } from '@/components/shared/error-boundary';
import { ReportsDashboard } from '@/components/reports/reports-dashboard';

export default function ReportsPage() {
  return (
    <ErrorBoundary>
      <ReportsDashboard />
    </ErrorBoundary>
  );
}
