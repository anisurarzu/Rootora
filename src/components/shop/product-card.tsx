"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        "group relative flex flex-col overflow-hidden rounded border border-border/70 bg-white transition-colors hover:border-primary/30",
        className
      )}
    >
      <Link href={`/shop/${product.slug}`} className="flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
          {showFullProduct ? (
            <div className="absolute inset-1.5 sm:inset-2">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                priority={priority}
                fit="contain"
                className="transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              priority={priority}
              fit="cover"
              className="transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}

          {hasDiscount ? (
            <span className="absolute left-1 top-1 z-[1] bg-destructive px-1 py-px text-[8px] font-bold leading-tight text-white sm:text-[9px]">
              -{discountPct}%
            </span>
          ) : null}

          <button
            type="button"
            className={cn(
              "absolute right-1 top-1 z-[1] flex h-6 w-6 items-center justify-center rounded-sm border border-border/40 bg-white/90 text-muted-foreground transition-colors hover:text-destructive sm:h-7 sm:w-7",
              inWishlist && "text-destructive"
            )}
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("h-3 w-3", inWishlist && "fill-destructive")}
            />
          </button>
        </div>

        <div className="flex flex-col gap-0.5 p-1.5 pt-1 sm:p-2 sm:pt-1.5">
          <h3 className="line-clamp-2 font-heading text-[10px] font-medium leading-snug text-heading sm:text-xs">
            <ProductTitle name={product.name} size="card" />
          </h3>

          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 leading-none">
              <p className="truncate font-button text-[11px] font-bold text-primary sm:text-xs">
                {formatPrice(product.price)}
              </p>
              {hasDiscount ? (
                <p className="mt-0.5 truncate text-[9px] text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </p>
              ) : null}
            </div>

            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 shrink-0 rounded-sm sm:h-7 sm:w-7"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}
