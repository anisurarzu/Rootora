"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
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

interface ProductShowcaseProps {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref: string;
  id?: string;
}

export function ProductShowcase({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  id,
}: ProductShowcaseProps) {
  return (
    <section
      id={id}
      className="section-padding bg-surface"
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <div className="container-rootora">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
            className="mb-0"
          />
          <Button variant="outline" asChild className="shrink-0">
            <Link href={viewAllHref}>
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <ProductGrid>
            {products.map((product, index) => (
              <motion.div key={product.id} variants={fadeInUp} className="h-full">
                <ProductCard product={product} priority={index < 2} />
              </motion.div>
            ))}
          </ProductGrid>
        </motion.div>
      </div>
    </section>
  );
}
