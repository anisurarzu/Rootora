"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductImage } from "@/components/shop/product-image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";

type CartPreviewProps = {
  className?: string;
  badgeClassName?: string;
};

export function CartPreview({ className, badgeClassName }: CartPreviewProps) {
  const [ready, setReady] = useState(false);
  const items = useCartStore((s) => s.items);
  const count = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  useEffect(() => {
    setReady(true);
  }, []);

  // Persist cart hydrates after mount — keep SSR/first paint empty to avoid mismatch.
  const safeItems = ready ? items : [];
  const safeCount = ready ? count : 0;
  const safeSubtotal = ready ? subtotal : 0;
  const preview = safeItems.slice(0, 4);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Cart, ${safeCount} items`}
          className={cn("relative h-10 w-10", className)}
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
          {safeCount > 0 ? (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground",
                badgeClassName
              )}
            >
              {safeCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className="z-[100] w-[min(100vw-2rem,22rem)] rounded-2xl border-black/[0.06] p-0 shadow-lift"
      >
        <div className="border-b border-black/[0.06] px-4 py-3">
          <p className="font-button text-sm font-semibold text-heading">
            Your bag
          </p>
          <p className="text-xs text-muted-foreground">
            {safeCount === 0
              ? "No items yet"
              : `${safeCount} item${safeCount === 1 ? "" : "s"}`}
          </p>
        </div>

        {preview.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Your bag is empty
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
              {preview.map((item) => (
                <li key={`${item.product.id}-${item.variantId ?? "base"}`}>
                  <Link
                    href={`/shop/${item.product.slug}`}
                    className="flex gap-3 rounded-xl transition-colors hover:bg-muted/50"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                      <div className="absolute inset-1.5">
                        <ProductImage
                          src={item.product.images[0] ?? ""}
                          alt={item.product.name}
                          fit="contain"
                          sizes="64px"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="line-clamp-2 text-sm font-medium text-heading">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty {item.quantity}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-black/[0.06] px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums text-heading">
                  {formatPrice(safeSubtotal)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cart">View bag</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
