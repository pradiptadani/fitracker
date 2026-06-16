import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({
  label = "Loading...",
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
