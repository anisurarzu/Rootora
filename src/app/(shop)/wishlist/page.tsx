"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container-rootora section-padding text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-6 font-heading text-3xl font-semibold text-heading">
            Your wishlist is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Save your favourite products and come back to them anytime.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/shop">Explore Products</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Saved"
          title="My Wishlist"
          description={`${items.length} item${items.length > 1 ? "s" : ""} saved for later`}
          align="left"
        />

        <ProductGrid>
          {items.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-muted-foreground shadow-soft backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                aria-label={`Remove ${product.name} from wishlist`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </ProductGrid>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/cart">View Cart</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
