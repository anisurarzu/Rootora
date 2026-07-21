import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { FlashSaleMiniCard } from "@/components/shop/flash-sale-mini-card";
import { Button } from "@/components/ui/button";
import { FlashSaleCountdown } from "@/features/home/flash-sale-countdown";
import type { FlashSaleContent } from "@/features/home/flash-sale-content";
import { cn } from "@/lib/utils";

interface FlashSaleSidebarProps {
  content: FlashSaleContent;
  /** Desktop sidebar list vs mobile product-card grid */
  layout?: "list" | "grid";
  className?: string;
}

export function FlashSaleSidebar({
  content,
  layout = "list",
  className,
}: FlashSaleSidebarProps) {
  const previewCount = Math.min(Math.max(content.productLimit || 3, 1), 3);
  const products = content.products.slice(0, previewCount);
  const hasMore = content.products.length > previewCount;
  if (!content.enabled || products.length === 0) return null;

  const isGrid = layout === "grid";
  const showCountdown =
    Boolean(content.endsAt) &&
    new Date(content.endsAt!).getTime() > Date.now();
  const detailsHref = content.viewAllHref || "/shop/flash-sale";
  const detailsLabel = content.viewAllLabel || "View details";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border/70 bg-white shadow-soft",
        isGrid ? "" : "h-full",
        className
      )}
    >
      <div className="border-b border-border/60 bg-[#fff5f0] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Zap className="h-4 w-4 shrink-0 text-orange-500" fill="currentColor" />
            <h3 className="truncate font-button text-sm font-bold uppercase tracking-wide text-heading">
              {content.title}
            </h3>
          </div>
          <Link
            href={detailsHref}
            className="shrink-0 font-button text-[10px] font-semibold uppercase tracking-wide text-primary hover:underline"
          >
            {content.shopAllLabel || "View details"}
          </Link>
        </div>
        {content.subtitle ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{content.subtitle}</p>
        ) : null}
        {showCountdown && content.endsAt ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-orange-600">
              Ends in
            </span>
            <FlashSaleCountdown endsAt={content.endsAt} />
          </div>
        ) : null}
      </div>

      {isGrid ? (
        <div className="grid grid-cols-3 gap-2 p-2">
          {products.map((product) => (
            <FlashSaleMiniCard
              key={product.id}
              product={product}
              variant="card"
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
          {products.map((product) => (
            <FlashSaleMiniCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="border-t border-border/60 p-2">
        <Button size="sm" variant="outline" className="h-8 w-full text-xs" asChild>
          <Link href={detailsHref}>
            {hasMore
              ? `${detailsLabel} (${content.products.length})`
              : detailsLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
