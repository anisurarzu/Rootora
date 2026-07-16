"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, slideInLeft, slideInRight, viewportOnce } from "@/lib/animations";

export function OrganicCollectionBanner() {
  return (
    <section className="section-padding bg-background" aria-label="Organic collection">
      <div className="container-rootora">
        <div className="overflow-hidden rounded-2xl bg-primary">
          <div className="grid lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={slideInLeft}
              className="flex flex-col justify-center p-8 md:p-12 lg:p-16"
            >
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                <Leaf className="h-4 w-4 text-accent" />
                <span className="font-button text-xs font-semibold uppercase tracking-wider text-accent">
                  Certified Organic
                </span>
              </div>

              <h2 className="font-heading text-3xl font-semibold text-primary-foreground md:text-4xl lg:text-5xl">
                The Organic Collection
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-primary-foreground/80">
                Every product in our organic collection is certified, traceable,
                and sourced from farmers who prioritize soil health and biodiversity.
              </p>

              <Button
                size="lg"
                variant="secondary"
                className="mt-8 w-fit"
                asChild
              >
                <Link href="/collections/organic">
                  Shop Organic
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={slideInRight}
              className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px]"
            >
              <Image
                src="/images/organic-banner.png"
                alt="Organic produce collection"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
