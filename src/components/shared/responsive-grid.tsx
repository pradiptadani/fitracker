import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

interface ResponsiveGridProps extends ComponentPropsWithoutRef<"div"> {
  columns?: 1 | 2 | 3 | 4;
}

const gridColumns: Record<NonNullable<ResponsiveGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function ResponsiveGrid({
  columns = 3,
  className,
  ...props
}: ResponsiveGridProps) {
  return (
    <div
      className={cn("grid gap-4", gridColumns[columns], className)}
      {...props}
    />
  );
}
