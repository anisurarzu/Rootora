import type { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopFilters } from "@/features/products/components/shop-filters";
import { ShopToolbar } from "@/features/products/components/shop-toolbar";
import { products } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse premium organic foods, fresh produce, spices, tea, honey, and artisan products from Bangladeshi farmers.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    filter?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  let filteredProducts = [...products];

  if (params.category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.slug === params.category
    );
  }

  if (params.q) {
    const query = params.q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.includes(query))
    );
  }

  if (params.filter === "fresh-today") {
    filteredProducts = filteredProducts.filter((p) => p.freshToday);
  }

  if (params.sort === "popular") {
    filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (params.sort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (params.sort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Shop"
          title="All Products"
          description="Premium Bangladeshi products sourced directly from local farmers and artisans."
          align="left"
        />

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
              <ShopFilters />
            </Suspense>
          </aside>

          <div className="flex-1">
            <Suspense fallback={null}>
              <ShopToolbar total={filteredProducts.length} />
            </Suspense>
            {filteredProducts.length > 0 ? (
              <ProductGrid className="mt-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            ) : (
              <div className="mt-12 text-center">
                <p className="font-heading text-xl text-heading">
                  No products found
                </p>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
