import type { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopFilters } from "@/features/products/components/shop-filters";
import { ShopToolbar } from "@/features/products/components/shop-toolbar";
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/features/products/storefront-queries";

export const dynamic = "force-dynamic";

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
  const [categories, filteredProducts] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(params),
  ]);

  return (
    <MainLayout>
      <div className="container-rootora px-4 pb-12 pt-6 sm:px-6 md:pb-16 md:pt-8 lg:px-8">
        <SectionHeading
          eyebrow="Shop"
          title="All Products"
          description="Premium Bangladeshi products sourced directly from local farmers and artisans."
          align="left"
          className="mb-5 md:mb-6"
          descriptionClassName="mt-2 text-sm md:text-base"
        />

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
          <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-xl bg-muted" />
              }
            >
              <ShopFilters categories={categories} />
            </Suspense>
          </aside>

          <div className="flex-1">
            <Suspense fallback={null}>
              <ShopToolbar total={filteredProducts.length} />
            </Suspense>
            {filteredProducts.length > 0 ? (
              <ProductGrid className="mt-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            ) : (
              <div className="mt-8 text-center">
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
