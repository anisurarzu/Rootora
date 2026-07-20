import { cn } from "@/lib/utils";

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  /** 3 columns on mobile — for compact homepage sections */
  compact?: boolean;
}

export function ProductGrid({ children, className, compact }: ProductGridProps) {
  return (
    <div
      className={cn(
        compact
          ? "grid grid-cols-3 gap-2 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5"
          : "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
}
