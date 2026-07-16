"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { motion, slideInLeft, slideInRight, viewportOnce } from "@/lib/animations";

export function TraditionalClothing() {
  return (
    <section className="section-padding bg-muted/30" aria-labelledby="clothing-heading">
      <div className="container-rootora">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={slideInLeft}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lift"
          >
            <Image
              src="/images/traditional-clothing.png"
              alt="Traditional Bangladeshi handloom clothing"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={slideInRight}
          >
            <SectionHeading
              eyebrow="Heritage"
              title="Traditional Clothing"
              description="Handwoven Jamdani, muslin, and artisan textiles — preserving centuries of Bangladeshi craftsmanship for the modern wardrobe."
              align="left"
            />

            <ul className="mt-6 space-y-3 text-muted-foreground">
              {[
                "Master weavers from Narayanganj & Comilla",
                "UNESCO recognized Jamdani techniques",
                "Sustainable, natural dyes & fibers",
                "Each piece uniquely handcrafted",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  {item}
                </li>
              ))}
            </ul>

            <Button size="lg" className="mt-8" asChild>
              <Link href="/collections/clothing">
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
