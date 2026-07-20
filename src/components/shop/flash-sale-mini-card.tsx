import Link from "next/link";
import { ProductImage } from "@/components/shop/product-image";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types";

interface FlashSaleMiniCardProps {
  product: Product;
  className?: string;
  variant?: "row" | "card";
}

export function FlashSaleMiniCard({
  product,
  className,
  variant = "row",
}: FlashSaleMiniCardProps) {
  const onSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discount = onSale
    ? getDiscountPercentage(product.originalPrice!, product.price)
    : 0;

  const showFullProduct =
    product.category.slug === "honey" ||
    product.tags.some((tag) => tag.toLowerCase().includes("honey"));

  if (variant === "card") {
    return (
      <Link
        href={`/shop/${product.slug}`}
        className={cn(
          "group flex flex-col overflow-hidden rounded border border-border/70 bg-white transition-colors hover:border-orange-400/50",
          className
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
          {showFullProduct ? (
            <div className="absolute inset-1.5">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                fit="contain"
                className="transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              className="transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
          {onSale ? (
            <span className="absolute left-1 top-1 bg-destructive px-1 py-px text-[8px] font-bold leading-tight text-white">
              -{discount}%
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-0.5 p-1.5">
          <p className="line-clamp-2 text-[10px] font-medium leading-tight text-heading group-hover:text-primary">
            {product.name}
          </p>
          <div className="flex flex-wrap items-baseline gap-1 leading-none">
            <span className="text-[11px] font-bold text-destructive">
              {formatPrice(product.price)}
            </span>
            {onSale ? (
              <span className="text-[9px] text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group flex gap-2 rounded border border-border/60 bg-white p-2 transition-colors hover:border-primary/30",
        className
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-muted/30">
        {showFullProduct ? (
          <div className="absolute inset-1">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              fit="contain"
              className="transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            className="transition-transform group-hover:scale-105"
          />
        )}
        {onSale ? (
          <span className="absolute left-0 top-0 bg-destructive px-1 py-px text-[8px] font-bold leading-tight text-white">
            -{discount}%
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[11px] font-medium leading-tight text-heading group-hover:text-primary">
          {product.name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-1">
          <span className="text-xs font-bold text-destructive">
            {formatPrice(product.price)}
          </span>
          {onSale ? (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
