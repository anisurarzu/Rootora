import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { farmers } from "@/lib/mock-data";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Our Farmers",
  description:
    "Meet the verified Bangladeshi farmers behind ROOTORA — dedicated growers preserving heritage, organic practices, and fair trade.",
};

export default function FarmersPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Our Partners"
          title="Meet the Farmers"
          description="Every ROOTORA product begins with a person — a farmer, a weaver, an artisan. Discover the stories behind your food and crafts."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {farmers.map((farmer) => (
            <article
              key={farmer.id}
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
                <h2 className="font-heading text-xl font-semibold text-heading">
                  {farmer.name}
                </h2>
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
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center md:p-12">
          <h2 className="font-heading text-2xl font-semibold text-heading">
            Partner with {siteConfig.name}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Are you a farmer or artisan producing organic, heritage, or handmade
            goods in Bangladesh? We would love to hear from you.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
