"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/product-image";
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

  const badges = [
    product.organic && { label: "Organic", variant: "success" as const },
    product.freshToday && { label: "Fresh", variant: "accent" as const },
    hasDiscount && {
      label: `-${getDiscountPercentage(product.originalPrice!, product.price)}%`,
      variant: "destructive" as const,
    },
  ].filter(Boolean) as { label: string; variant: "success" | "accent" | "destructive" }[];

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

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lift",
        className
      )}
    >
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-muted/50">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            priority={priority}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {badges.length > 0 && (
            <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-0.5">
              {badges.slice(0, 2).map((badge) => (
                <Badge
                  key={badge.label}
                  variant={badge.variant}
                  className="h-4 px-1 text-[8px] font-semibold uppercase tracking-wide"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-1.5 top-1.5 h-6 w-6 rounded-full border-border/60 bg-surface/90 shadow-soft backdrop-blur-sm transition-all",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
              inWishlist && "opacity-100"
            )}
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-3 w-3 transition-colors",
                inWishlist && "fill-destructive text-destructive"
              )}
            />
          </Button>

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/10 to-transparent p-1.5 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              className="h-6 w-full text-[10px]"
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-3 w-3" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="flex min-h-[4.75rem] flex-1 flex-col px-2.5 pb-2 pt-1.5">
          <p className="truncate text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {product.category.name}
          </p>

          <h3 className="mt-0.5 min-h-[1.875rem] font-heading text-[13px] font-medium leading-snug text-heading line-clamp-2">
            {product.name}
          </h3>

          <p
            className={cn(
              "mt-0.5 h-3 truncate text-[9px] text-muted-foreground",
              !product.farmer && "invisible"
            )}
          >
            {product.farmer ? `by ${product.farmer.name}` : "—"}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <div className="flex min-w-0 items-baseline gap-1">
              <span className="truncate font-button text-xs font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="shrink-0 text-[8px] text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-warning text-warning" />
              <span className="text-[10px] font-medium">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
