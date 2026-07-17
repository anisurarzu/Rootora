"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import type { Category } from "@/types";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="section-padding bg-background" aria-labelledby="categories-heading">
      <div className="container-rootora">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          description="Explore our curated collections of premium Bangladeshi products, from farm-fresh produce to artisan crafts."
          descriptionClassName="text-sm md:text-base"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mx-auto grid max-w-5xl grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={fadeInUp}>
              <Link
                href={`/shop?category=${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg sm:rounded-xl"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 30vw, 200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                  <div className="flex items-end justify-between gap-1">
                    <div className="min-w-0">
                      <h3 className="truncate font-heading text-xs font-semibold text-white sm:text-base">
                        {category.name}
                      </h3>
                      <p className="mt-0.5 text-[9px] text-white/70 sm:text-xs">
                        {category.productCount} products
                      </p>
                    </div>
                    <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
