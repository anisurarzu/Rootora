import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Recycle, Sprout } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sustainability",
  description: `${siteConfig.name} commitment to organic farming, fair trade, eco-conscious packaging, and preserving Bangladeshi agricultural heritage.`,
};

const initiatives = [
  {
    icon: Sprout,
    title: "Organic Farming Partnerships",
    description:
      "We work exclusively with certified organic farms that prioritize soil health, biodiversity, and chemical-free cultivation across Bangladesh.",
  },
  {
    icon: Recycle,
    title: "Eco-Conscious Packaging",
    description:
      "Our packaging uses recyclable cardboard, minimal plastic, and biodegradable insulation for perishables. Gift hampers use reusable branded boxes.",
  },
  {
    icon: Leaf,
    title: "Carbon-Conscious Logistics",
    description:
      "We optimize delivery routes to reduce emissions and partner with local couriers to minimize long-haul transport for fresh produce.",
  },
];

export default function SustainabilityPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Our Commitment"
          title="Sustainability at ROOTORA"
          description="Building a food system that nourishes people and planet — one harvest at a time."
        />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft">
            <Image
              src="/images/organic-honey-banner.png"
              alt="ROOTORA organic forest honey and mustard oil"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-heading">
              Farm to Future
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Sustainability is not a feature at ROOTORA — it is the foundation.
              Every decision, from which farmers we partner with to how we pack
              and deliver your order, is guided by a commitment to environmental
              stewardship and social equity.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Bangladesh&apos;s agricultural heritage spans millennia. By
              supporting organic practices, heritage seed preservation, and fair
              trade, ROOTORA helps ensure that future generations inherit
              fertile land, diverse ecosystems, and thriving rural communities.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {initiatives.map(({ icon: Icon, title, description }) => (
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

        <div className="mt-20 space-y-6 rounded-2xl border border-border bg-muted/30 p-8 md:p-12">
          <h2 className="font-heading text-2xl font-semibold text-heading">
            Fair Trade & Farmer Livelihoods
          </h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            Direct sourcing eliminates unnecessary middlemen, ensuring farmers
            receive fair prices for their produce. We publish farmer profiles,
            visit partner farms regularly, and invest in community development
            programs including organic certification support and seed bank
            funding.
          </p>
          <Button asChild>
            <Link href="/farmers">Meet Our Farmers</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
