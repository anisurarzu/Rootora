import { cn } from "@/lib/utils";

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  /** @deprecated All grids use the same responsive columns now */
  compact?: boolean;
}

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 items-start gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
}
