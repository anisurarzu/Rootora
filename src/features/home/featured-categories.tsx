"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border/70 bg-white",
        "transition-shadow duration-300 hover:shadow-soft"
      )}
    >
      <div className="relative aspect-square bg-white p-2 sm:p-2.5">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
        />
      </div>
      <div className="border-t border-border/50 px-1.5 py-2 text-center sm:px-2 sm:py-2.5">
        <h3 className="line-clamp-2 font-heading text-[11px] font-semibold leading-tight text-heading sm:text-sm">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section
      className="bg-surface py-4 sm:py-5"
      aria-labelledby="categories-heading"
    >
      <div className="container-rootora">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <div>
            <p className="font-button text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary sm:text-xs">
              Browse
            </p>
            <h2
              id="categories-heading"
              className="font-heading text-lg font-semibold text-heading sm:text-xl"
            >
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-1 font-button text-xs font-semibold text-primary transition-colors hover:text-heading sm:gap-1.5 sm:text-sm"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-3 gap-2 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={fadeInUp}>
              <CategoryTile category={category} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
