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

const badgeBase =
  "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-white sm:text-[10px]";

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
        "group relative flex h-full w-full flex-col overflow-hidden rounded-sm border border-border/80 bg-white",
        "transition-[border-color,box-shadow] duration-300 ease-out",
        "hover:border-border hover:shadow-soft",
        !product.inStock && "opacity-85",
        className
      )}
    >
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[11/10] shrink-0 overflow-hidden bg-[#f7f6f2]">
          {showFullProduct ? (
            <div className="absolute inset-2 sm:inset-2.5">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                priority={priority}
                fit="contain"
                className="object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              priority={priority}
              fit="cover"
              className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          )}

          <div className="absolute left-2 top-2 z-[1] flex flex-col items-start gap-1">
            {product.newArrival ? (
              <span className={cn(badgeBase, "bg-heading")}>New</span>
            ) : null}
            {hasDiscount ? (
              <span className={cn(badgeBase, "bg-destructive")}>
                −{discountPct}%
              </span>
            ) : null}
            {product.organic ? (
              <span className={cn(badgeBase, "bg-primary")}>
                <Leaf className="h-2.5 w-2.5" aria-hidden />
                Organic
              </span>
            ) : null}
            {product.bestSeller ? (
              <span className={cn(badgeBase, "bg-[#9a7b2f]")}>Best</span>
            ) : null}
          </div>

          <button
            type="button"
            className={cn(
              "absolute right-2 top-2 z-[1] flex h-7 w-7 items-center justify-center rounded-full",
              "border border-border/60 bg-white/95 text-muted-foreground shadow-sm",
              "transition-colors duration-200 hover:border-border hover:text-destructive",
              "sm:h-8 sm:w-8",
              inWishlist && "border-destructive/30 text-destructive"
            )}
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("h-3.5 w-3.5", inWishlist && "fill-destructive")}
            />
          </button>

          {!product.inStock ? (
            <div className="absolute inset-0 z-[2] flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <span className="rounded bg-heading px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                Sold out
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-[1] hidden p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
            <Button
              size="sm"
              className="h-8 w-full rounded-sm text-xs font-semibold tracking-wide"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              Add to cart
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {product.category.name}
          </p>

          <h3 className="line-clamp-2 font-heading text-[14px] font-semibold leading-snug tracking-tight text-heading transition-colors duration-200 group-hover:text-primary sm:text-[15px]">
            <ProductTitle name={product.name} size="card" />
          </h3>

          {product.reviewCount > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star
                className="h-3 w-3 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="font-medium tabular-nums text-heading">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground/70">
                ({product.reviewCount})
              </span>
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <p className="font-button text-[15px] font-bold tabular-nums tracking-tight text-heading sm:text-base">
                  {formatPrice(product.price)}
                </p>
                {hasDiscount ? (
                  <p className="text-[11px] tabular-nums text-muted-foreground line-through sm:text-xs">
                    {formatPrice(product.originalPrice!)}
                  </p>
                ) : null}
              </div>
              {hasDiscount && savings > 0 ? (
                <p className="mt-0.5 text-[10px] font-medium text-primary sm:text-[11px]">
                  Save {formatPrice(savings)}
                </p>
              ) : null}
            </div>

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0 rounded-full border-border/80 bg-white transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground md:hidden"
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
