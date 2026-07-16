import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import {
  getFeaturedProducts,
  getOrganicProducts,
  getSeasonalProducts,
  products,
} from "@/lib/mock-data";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

const collectionMeta: Record<
  string,
  { title: string; description: string; eyebrow: string }
> = {
  organic: {
    eyebrow: "Organic",
    title: "Organic Collection",
    description:
      "Certified organic products from Bangladeshi farms — free from synthetic pesticides and GMOs.",
  },
  seasonal: {
    eyebrow: "Seasonal",
    title: "Seasonal Harvest",
    description:
      "Peak-season produce available for a limited window — freshness you can taste.",
  },
  "gift-boxes": {
    eyebrow: "Gifts",
    title: "Gift Boxes & Hampers",
    description:
      "Curated hampers and gift-ready collections for every occasion.",
  },
  clothing: {
    eyebrow: "Heritage",
    title: "Traditional Clothing",
    description:
      "Handloom textiles and artisan sarees celebrating Bangladeshi weaving traditions.",
  },
  festival: {
    eyebrow: "Celebrations",
    title: "Festival Picks",
    description:
      "Featured products perfect for Eid, Pohela Boishakh, and special gatherings.",
  },
  handmade: {
    eyebrow: "Artisan",
    title: "Handmade & Artisan",
    description:
      "Crafts made by hand — from woven textiles to stone-ground spices.",
  },
};

const validSlugs = Object.keys(collectionMeta);

function getCollectionProducts(slug: string): {
  products: typeof products;
  isFallback: boolean;
} {
  switch (slug) {
    case "organic":
      return { products: getOrganicProducts(), isFallback: false };
    case "seasonal":
      return { products: getSeasonalProducts(), isFallback: false };
    case "gift-boxes":
      return {
        products: products.filter(
          (p) =>
            p.tags.includes("gift") ||
            p.category.slug === "gift-boxes" ||
            p.name.toLowerCase().includes("gift")
        ),
        isFallback: false,
      };
    case "clothing":
      return {
        products: products.filter(
          (p) => p.category.slug === "traditional-clothing"
        ),
        isFallback: false,
      };
    case "festival":
      return { products: getFeaturedProducts(), isFallback: false };
    case "handmade":
      return {
        products: products.filter(
          (p) =>
            p.tags.includes("handmade") ||
            p.category.slug === "traditional-clothing"
        ),
        isFallback: false,
      };
    default:
      return { products, isFallback: true };
  }
}

export async function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = collectionMeta[slug];

  if (!meta) {
    return {
      title: "Collection",
      description: "Browse ROOTORA product collections.",
    };
  }

  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;
  const meta = collectionMeta[slug] ?? {
    eyebrow: "Collection",
    title: "All Products",
    description: "Browse our full catalog of premium Bangladeshi products.",
  };

  const { products: collectionProducts, isFallback } =
    getCollectionProducts(slug);

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <Link
          href="/collections"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All Collections
        </Link>

        <SectionHeading
          eyebrow={meta.eyebrow}
          title={meta.title}
          description={meta.description}
          align="left"
        />

        {(isFallback || !collectionMeta[slug]) && (
          <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Showing all products — this collection is being curated. Check back
            soon for a tailored selection.
          </div>
        )}

        {collectionProducts.length > 0 ? (
          <ProductGrid>
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        ) : (
          <div className="py-16 text-center">
            <p className="font-heading text-xl text-heading">
              No products in this collection yet
            </p>
            <p className="mt-2 text-muted-foreground">
              New items are added regularly. Explore our full shop in the
              meantime.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
