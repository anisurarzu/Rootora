"use client";

import { cn } from "@/lib/utils";

export function TypingDots({
  label = "typing",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-heading shadow-sm ring-1 ring-border/60",
        className
      )}
      aria-live="polite"
      aria-label={label}
    >
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
      </span>
    </div>
  );
}
