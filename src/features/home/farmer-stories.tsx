"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { farmers } from "@/lib/mock-data";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";

export function FarmerStories() {
  return (
    <section className="section-padding bg-background" aria-labelledby="farmers-heading">
      <div className="container-rootora">
        <SectionHeading
          eyebrow="Our Partners"
          title="Meet the Farmers"
          description="Every product tells a story. Meet the dedicated farmers who bring Bangladesh's finest produce to your home."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {farmers.map((farmer) => (
            <motion.article
              key={farmer.id}
              variants={fadeInUp}
              className="group overflow-hidden rounded-xl border border-border bg-surface shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={farmer.image}
                  alt={farmer.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {farmer.verified && (
                  <Badge className="absolute left-4 top-4 gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-heading">
                  {farmer.name}
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  {farmer.village}, {farmer.district}
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {farmer.story}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {farmer.productCount} products
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/farmers/${farmer.slug}`}>
                      View Profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/farmers">
              View All Farmers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
