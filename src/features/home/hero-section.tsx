"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, motion, slideInLeft, slideInRight } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container-rootora section-padding">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            className="order-2 lg:order-1"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-soft">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="font-button text-xs font-medium uppercase tracking-wider text-secondary">
                Naturally Bangladeshi
              </span>
            </div>

            <h1 className="font-heading text-4xl font-semibold leading-[1.1] text-heading sm:text-5xl lg:text-6xl xl:text-7xl">
              From Bangladeshi{" "}
              <span className="text-primary">Farms</span> to Your Table
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Discover premium organic foods, fresh produce, and artisan products
              — sourced directly from local farmers who nurture the land with
              care and tradition.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/farmers">Meet Our Farmers</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { value: "500+", label: "Products" },
                { value: "120+", label: "Farmers" },
                { value: "50K+", label: "Happy Customers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-semibold text-primary lg:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lift bg-muted">
              <Image
                src="/images/hero-produce-original.png"
                alt="Fresh organic produce from Bangladeshi farms — mangoes, rice, honey, and vegetables"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-surface p-4 shadow-lift md:flex md:items-center md:gap-3 lg:-left-8"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/images/hero-mango-thumb.png"
                  alt="Langra mango"
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
              <p className="font-button text-xs font-semibold uppercase tracking-wider text-secondary">
                Fresh Today
              </p>
              <p className="mt-1 font-heading text-lg font-semibold text-heading">
                Langra Mangoes
              </p>
              <p className="text-sm text-muted-foreground">Rajshahi, Bangladesh</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
