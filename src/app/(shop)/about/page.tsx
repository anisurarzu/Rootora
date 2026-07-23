import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.name} — ${siteConfig.tagline} Premium Bangladeshi ecommerce connecting you directly with local farmers and artisans.`,
};

const values = [
  {
    icon: Leaf,
    title: "Organic & Sustainable",
    description:
      "We partner exclusively with certified organic farms and eco-conscious producers, ensuring every product supports soil health and biodiversity.",
  },
  {
    icon: Users,
    title: "Farmer First",
    description:
      "Direct sourcing means fair prices for farmers. No unnecessary middlemen — just transparent relationships built on trust and respect.",
  },
  {
    icon: Heart,
    title: "Heritage Preserved",
    description:
      "From heirloom rice varieties to handloom Jamdani sarees, we celebrate Bangladeshi traditions that deserve to thrive in the modern world.",
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Our Story"
          title={`About ${siteConfig.name}`}
          description={siteConfig.description}
        />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft">
            <Image
              src="/images/hero-farm-produce.png"
              alt="Fresh farm produce from Bangladesh"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-heading">
              Naturally Bangladeshi
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              ROOTORA was born from a simple belief: Bangladesh produces some of
              the world&apos;s finest foods, textiles, and artisan crafts — yet
              too often they reach consumers through opaque supply chains that
              dilute quality and exploit producers.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              We set out to change that. ROOTORA is a premium marketplace that
              connects you directly with verified farmers, weavers, and artisans
              across Bangladesh. Every product tells a story — of a village in
              Sylhet, an orchard in Rajshahi, a loom in Narayanganj.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Our mission is to make Bangladeshi heritage accessible without
              compromise: organic certification you can trust, packaging worthy
              of the product inside, and prices that keep farming communities
              thriving.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Our Values"
            description="Three principles guide everything we do at ROOTORA."
          />

          <div className="grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-surface p-8 shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-heading">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-2xl border border-border bg-muted/30 p-8 text-center md:p-12">
          <h2 className="font-heading text-2xl font-semibold text-heading">
            Join the ROOTORA Community
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Discover seasonal harvests and experience the best of Bangladesh —
            delivered to your door.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/shop">Shop Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/track-order">Track Order</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
