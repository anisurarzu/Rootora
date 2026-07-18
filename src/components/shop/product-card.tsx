"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

  const showFullProduct =
    product.category.slug === "honey" ||
    product.tags.some((tag) => tag.toLowerCase().includes("honey"));

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lift",
        className
      )}
    >
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden",
            showFullProduct
              ? "aspect-square bg-[#f6f4ef]"
              : "aspect-[4/3] bg-muted/50"
          )}
        >
          {showFullProduct ? (
            <div className="absolute inset-2 sm:inset-3">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                priority={priority}
                fit="contain"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              priority={priority}
              fit="cover"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          )}

          {badges.length > 0 && (
            <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-0.5">
              {badges.slice(0, 2).map((badge) => (
                <Badge
                  key={badge.label}
                  variant={badge.variant}
                  className="h-4 px-1 text-[9px] font-semibold uppercase tracking-wide"
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
              "absolute right-1.5 top-1.5 h-7 w-7 rounded-full border-border/60 bg-surface/90 shadow-soft backdrop-blur-sm transition-all",
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
              className="h-7 w-full text-[11px]"
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-3 w-3" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {product.category.name}
          </p>

          <h3 className="mt-0.5 font-heading text-sm font-medium leading-snug text-heading line-clamp-2 sm:text-[15px]">
            <ProductTitle name={product.name} size="card" />
          </h3>

          {product.farmer ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              by {product.farmer.name}
            </p>
          ) : null}

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-1">
              <span className="truncate font-button text-sm font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="shrink-0 text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-[11px] font-medium">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
