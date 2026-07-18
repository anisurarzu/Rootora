"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
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
        "group relative block aspect-[5/4] overflow-hidden rounded-xl bg-muted shadow-soft ring-1 ring-black/5 transition-all duration-500 sm:aspect-[4/3]",
        "hover:-translate-y-0.5 hover:shadow-lift hover:ring-primary/25"
      )}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1c]/85 via-[#1a2e1c]/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-3.5">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm font-semibold text-white sm:text-base">
            {category.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-white/70 sm:text-xs">
            {category.productCount}{" "}
            {category.productCount === 1 ? "product" : "products"}
          </p>
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
          aria-hidden
        >
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden py-8 md:py-12"
      aria-labelledby="categories-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7f4ec_0%,#fefcf3_100%)]"
        aria-hidden
      />

      <div className="container-rootora relative">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Browse"
            title="Shop by Category"
            description="Explore ROOTORA collections from across Bangladesh."
            align="left"
            className="mb-0 md:mb-0"
            descriptionClassName="mt-1.5 max-w-xl text-sm"
          />
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-2 self-start font-button text-sm font-semibold text-primary transition-colors hover:text-heading sm:self-auto"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-5"
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
