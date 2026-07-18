"use client";

import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  columnLabel,
  filterChartByAvailableSizes,
  getSizeChartForCategory,
} from "@/features/products/lib/size-charts";
import { cn } from "@/lib/utils";

interface SizeGuideProps {
  categorySlug: string;
  availableSizes: string[];
  selectedSize?: string | null;
  className?: string;
}

export function SizeGuide({
  categorySlug,
  availableSizes,
  selectedSize,
  className,
}: SizeGuideProps) {
  const chart = filterChartByAvailableSizes(
    getSizeChartForCategory(categorySlug),
    availableSizes
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 font-button text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline",
            className
          )}
        >
          <Ruler className="h-3.5 w-3.5" />
          Size guide
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md gap-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{chart.title}</DialogTitle>
          <DialogDescription>
            Measurements in inches. Find your fit before ordering.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="px-3 py-2.5 font-button text-xs font-semibold uppercase tracking-wide text-heading">
                  Size
                </th>
                {chart.columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2.5 font-button text-xs font-semibold uppercase tracking-wide text-heading"
                  >
                    {columnLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row) => {
                const active =
                  selectedSize?.toUpperCase() === row.size.toUpperCase();
                return (
                  <tr
                    key={row.size}
                    className={cn(
                      "border-b border-border/70 last:border-0",
                      active && "bg-primary/10"
                    )}
                  >
                    <td
                      className={cn(
                        "px-3 py-2.5 font-button font-semibold",
                        active ? "text-primary" : "text-heading"
                      )}
                    >
                      {row.size}
                    </td>
                    {chart.columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2.5 tabular-nums text-muted-foreground"
                      >
                        {row[col] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {chart.note}
        </p>
      </DialogContent>
    </Dialog>
  );
}
