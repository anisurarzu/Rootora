import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore curated ROOTORA collections — organic staples, seasonal harvests, gift hampers, festival picks, traditional clothing, and handmade crafts.",
};

const collections = [
  {
    slug: "organic",
    title: "Organic Collection",
    description:
      "Certified organic forest honey and cold-pressed mustard oil — pure, traceable staples from Bangladeshi farms.",
    image: "/images/categories/organic-honey.png",
  },
  {
    slug: "seasonal",
    title: "Seasonal Harvest",
    description:
      "Peak-season fruits and vegetables picked at perfect ripeness — available for a limited time.",
    image: "/images/products/mango.png",
  },
  {
    slug: "gift-boxes",
    title: "Gift Boxes & Hampers",
    description:
      "Thoughtfully curated hampers featuring honey, tea, spices, and premium staples — perfect for any occasion.",
    image: "/images/gift-box.png",
  },
  {
    slug: "festival",
    title: "Festival Picks",
    description:
      "Featured products for Eid, Pohela Boishakh, and celebrations — premium quality for special moments.",
    image: "/images/products/spices.png",
  },
  {
    slug: "clothing",
    title: "Traditional Clothing",
    description:
      "Handloom Jamdani sarees and artisan textiles — UNESCO-recognized heritage craftsmanship.",
    image: "/images/traditional-clothing-v2.png",
  },
  {
    slug: "handmade",
    title: "Handmade & Artisan",
    description:
      "Crafts made by hand — from woven textiles to stone-ground spices and artisan tea blends.",
    image: "/images/instagram-05-textile.png",
  },
];

export default function CollectionsPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Curated"
          title="Shop by Collection"
          description="Discover ROOTORA products organized by theme — whether you seek organic staples, seasonal delights, or heritage crafts."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.slug}
              className="group overflow-hidden rounded-xl border border-border bg-surface shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <Link href={`/collections/${collection.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-heading text-xl font-semibold text-heading transition-colors group-hover:text-primary">
                    {collection.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {collection.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Browse Collection
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/shop">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
