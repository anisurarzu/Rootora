import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { Badge } from "@/components/ui/badge";
import {
  farmers,
  getFarmerBySlug,
  getProductsByFarmer,
} from "@/lib/mock-data";

interface FarmerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return farmers.map((farmer) => ({ slug: farmer.slug }));
}

export async function generateMetadata({
  params,
}: FarmerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const farmer = getFarmerBySlug(slug);
  if (!farmer) return { title: "Farmer Not Found" };

  return {
    title: farmer.name,
    description: farmer.story,
    openGraph: {
      title: `${farmer.name} — ROOTORA Farmer`,
      description: farmer.story,
      images: [{ url: farmer.image }],
    },
  };
}

export default async function FarmerDetailPage({ params }: FarmerPageProps) {
  const { slug } = await params;
  const farmer = getFarmerBySlug(slug);

  if (!farmer) notFound();

  const farmerProducts = getProductsByFarmer(slug);

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <Link
          href="/farmers"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All Farmers
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-soft lg:aspect-square">
            <Image
              src={farmer.image}
              alt={farmer.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              {farmer.verified && (
                <Badge className="gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Verified Farmer
                </Badge>
              )}
              <Badge variant="outline">{farmer.productCount} products</Badge>
            </div>

            <h1 className="mt-4 font-heading text-3xl font-semibold text-heading md:text-4xl">
              {farmer.name}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-secondary">
              <MapPin className="h-4 w-4" />
              {farmer.village}, {farmer.district}
            </p>

            <p className="mt-6 leading-relaxed text-muted-foreground">
              {farmer.story}
            </p>
          </div>
        </div>

        {farmer.gallery.length > 0 && (
          <div className="mt-16 border-t border-border pt-16">
            <h2 className="font-heading text-2xl font-semibold text-heading">
              Gallery
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {farmer.gallery.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl border border-border"
                >
                  <Image
                    src={img}
                    alt={`${farmer.name} gallery ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-border pt-16">
          <h2 className="font-heading text-2xl font-semibold text-heading">
            Products by {farmer.name}
          </h2>
          {farmerProducts.length > 0 ? (
            <ProductGrid className="mt-8">
              {farmerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <p className="mt-6 text-muted-foreground">
              No products listed yet. Check back soon.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
