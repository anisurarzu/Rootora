"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ProductShowcaseProps {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref: string;
  id?: string;
  /** Tighter layout for homepage sections */
  compact?: boolean;
}

export function ProductShowcase({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  id,
  compact = false,
}: ProductShowcaseProps) {
  return (
    <section
      id={id}
      className={cn(
        "bg-surface",
        compact ? "py-4 sm:py-5" : "section-padding"
      )}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <div className="container-rootora">
        <div
          className={cn(
            "flex items-end justify-between gap-3",
            compact ? "mb-3 sm:mb-4" : "mb-12 flex-col md:mb-16 md:flex-row"
          )}
        >
          <div>
            <p
              className={cn(
                "font-button font-semibold uppercase tracking-[0.18em] text-secondary",
                compact ? "text-[10px] sm:text-xs" : "mb-3 text-xs"
              )}
            >
              {eyebrow}
            </p>
            <h2
              id={id ? `${id}-heading` : undefined}
              className={cn(
                "font-heading font-semibold text-heading",
                compact ? "text-lg sm:text-xl" : "text-2xl md:text-3xl lg:text-4xl"
              )}
            >
              {title}
            </h2>
            {description && !compact ? (
              <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className="shrink-0"
            asChild
          >
            <Link href={viewAllHref}>
              View All
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <ProductGrid compact={compact}>
            {products.map((product, index) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} priority={index < 3} />
              </motion.div>
            ))}
          </ProductGrid>
        </motion.div>
      </div>
    </section>
  );
}
