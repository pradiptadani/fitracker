import { notFound } from 'next/navigation';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { ReportsDashboard } from '@/components/reports/reports-dashboard';

export default async function ReportTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const validTypes = ['monthly', 'cashflow', 'categories', 'budgets', 'accounts'];
  
  if (!validTypes.includes(type)) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold capitalize tracking-tight">{type} Report</h2>
          <p className="text-muted-foreground">Detailed view for the {type} report segment.</p>
        </div>
        <ReportsDashboard />
      </div>
    </ErrorBoundary>
  );
}
