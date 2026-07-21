import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { getFlashSaleContent } from "@/features/home/flash-sale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flash Sale",
  description: "Limited-time Flash Sale deals on ROOTORA.",
};

export default async function FlashSalePage() {
  const flashSale = await getFlashSaleContent();
  const products = flashSale.enabled ? flashSale.products : [];

  return (
    <MainLayout>
      <div className="container-rootora px-4 pb-12 pt-6 sm:px-6 md:pb-16 md:pt-8 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-8">
          <p className="font-button text-xs font-semibold uppercase tracking-wider text-orange-600">
            Limited offers
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-heading md:text-4xl">
            {flashSale.title || "Flash Sale"}
          </h1>
          {flashSale.subtitle ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {flashSale.subtitle}
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              All Flash Sale products in one place.
            </p>
          )}
        </header>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="font-heading text-xl font-semibold text-heading">
              No Flash Sale products right now
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon, or browse the full shop.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <ProductGrid>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </MainLayout>
  );
}
