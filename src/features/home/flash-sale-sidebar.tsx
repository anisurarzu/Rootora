import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { FlashSaleMiniCard } from "@/components/shop/flash-sale-mini-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface FlashSaleSidebarProps {
  products: Product[];
  /** Desktop sidebar list vs mobile product-card grid */
  layout?: "list" | "grid";
  className?: string;
}

export function FlashSaleSidebar({
  products,
  layout = "list",
  className,
}: FlashSaleSidebarProps) {
  if (products.length === 0) return null;

  const isGrid = layout === "grid";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border/70 bg-white shadow-soft",
        isGrid ? "" : "h-full",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-[#fff5f0] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-orange-500" fill="currentColor" />
          <h3 className="font-button text-sm font-bold uppercase tracking-wide text-heading">
            Flash Sale
          </h3>
        </div>
        <Link
          href="/shop?filter=on-sale"
          className="font-button text-[10px] font-semibold uppercase tracking-wide text-primary hover:underline"
        >
          Shop all
        </Link>
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
          <Link href="/shop?filter=on-sale">
            View all deals
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
