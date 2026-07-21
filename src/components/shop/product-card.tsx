"use client";

import Link from "next/link";
import { Heart, Leaf, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/product-image";
import { ProductTitle } from "@/components/shop/product-title";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? getDiscountPercentage(product.originalPrice!, product.price)
    : 0;
  const savings =
    hasDiscount && product.originalPrice
      ? product.originalPrice - product.price
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(
      inWishlist ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  const showFullProduct =
    product.category.slug === "honey" ||
    product.tags.some((tag) => tag.toLowerCase().includes("honey"));

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded bg-white ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 hover:ring-primary/25",
        !product.inStock && "opacity-90",
        className
      )}
    >
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[5/4] shrink-0 overflow-hidden bg-gradient-to-b from-muted/10 via-white to-muted/15">
          {showFullProduct ? (
            <div className="absolute inset-1.5 sm:inset-2">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                priority={priority}
                fit="contain"
                className="object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              priority={priority}
              fit="cover"
              className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-1.5 top-1.5 z-[1] flex max-w-[calc(100%-2.75rem)] flex-wrap gap-1 sm:left-2 sm:top-2">
            {product.newArrival ? (
              <span className="rounded-sm bg-heading px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white shadow-sm sm:text-[11px]">
                New
              </span>
            ) : null}
            {hasDiscount ? (
              <span className="rounded-sm bg-gradient-to-r from-destructive to-orange-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm sm:text-[11px]">
                -{discountPct}%
              </span>
            ) : null}
            {product.organic ? (
              <span className="inline-flex items-center gap-0.5 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground sm:text-[11px]">
                <Leaf className="h-2.5 w-2.5" aria-hidden />
                Organic
              </span>
            ) : null}
            {product.bestSeller ? (
              <span className="rounded-sm bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white sm:text-[11px]">
                Best
              </span>
            ) : null}
          </div>

          <button
            type="button"
            className={cn(
              "absolute right-1.5 top-1.5 z-[1] flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-destructive sm:right-2 sm:top-2 sm:h-8 sm:w-8",
              inWishlist && "text-destructive"
            )}
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("h-3.5 w-3.5", inWishlist && "fill-destructive")}
            />
          </button>

          {!product.inStock ? (
            <div className="absolute inset-0 z-[2] flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-heading px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white sm:text-xs">
                Sold out
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-[1] hidden translate-y-full p-2 transition-transform duration-300 group-hover:translate-y-0 md:block">
            <Button
              size="sm"
              className="h-8 w-full rounded text-xs font-semibold shadow-md"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              Add to cart
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2 pt-1 sm:px-3 sm:pb-2.5">
          {product.reviewCount > 0 ? (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
              <Star
                className="h-3 w-3 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="font-semibold text-heading">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground/75">
                ({product.reviewCount})
              </span>
            </div>
          ) : null}

          <h3 className="line-clamp-2 min-h-[2lh] font-heading text-xs font-semibold leading-snug tracking-tight text-heading transition-colors group-hover:text-primary sm:text-sm">
            <ProductTitle name={product.name} size="card" />
          </h3>

          <div className="mt-auto flex min-h-[2.5rem] items-end justify-between gap-1.5 sm:min-h-[2.75rem]">
            <div className="min-w-0">
              <p className="truncate font-button text-sm font-bold tabular-nums tracking-tight text-primary sm:text-base">
                {formatPrice(product.price)}
              </p>
              <div className="mt-1 flex min-h-[16px] flex-wrap items-center gap-1.5">
                {hasDiscount ? (
                  <>
                    <p className="truncate text-[11px] text-muted-foreground line-through sm:text-xs">
                      {formatPrice(product.originalPrice!)}
                    </p>
                    {savings > 0 ? (
                      <span className="rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 sm:text-[11px]">
                        Save {formatPrice(savings)}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 shrink-0 rounded-full shadow-sm transition-transform hover:scale-105 md:hidden"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}
