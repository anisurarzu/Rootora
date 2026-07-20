import Link from "next/link";
import { ProductImage } from "@/components/shop/product-image";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types";

interface FlashSaleMiniCardProps {
  product: Product;
  className?: string;
}

export function FlashSaleMiniCard({ product, className }: FlashSaleMiniCardProps) {
  const onSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discount = onSale
    ? getDiscountPercentage(product.originalPrice!, product.price)
    : 0;

  const showFullProduct =
    product.category.slug === "honey" ||
    product.tags.some((tag) => tag.toLowerCase().includes("honey"));

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group flex gap-2 rounded-md border border-border/60 bg-white p-2 transition-colors hover:border-primary/30 hover:bg-muted/30",
        className
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted/40">
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
          <span className="absolute left-0 top-0 rounded-br bg-destructive px-1 py-0.5 text-[9px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[11px] font-medium leading-tight text-heading group-hover:text-primary">
          {product.name}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-1">
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
