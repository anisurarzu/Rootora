"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { categories } from "@/lib/mock-data";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";

export function FeaturedCategories() {
  return (
    <section className="section-padding bg-background" aria-labelledby="categories-heading">
      <div className="container-rootora">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          description="Explore our curated collections of premium Bangladeshi products, from farm-fresh produce to artisan crafts."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={fadeInUp}>
              <Link
                href={`/shop?category=${category.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/70 md:text-sm">
                        {category.productCount} products
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
