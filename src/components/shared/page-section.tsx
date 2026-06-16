import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

interface PageSectionProps extends ComponentPropsWithoutRef<"section"> {
  title?: string;
  description?: string;
}

export function PageSection({
  title,
  description,
  className,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {(title || description) ? (
        <div className="space-y-1">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
