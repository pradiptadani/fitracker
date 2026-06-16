import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ContentCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: ContentCardProps) {
  return (
    <Card className={className}>
      {(title || description || action) ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent
        className={cn(!(title || description || action) && "pt-6", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}
