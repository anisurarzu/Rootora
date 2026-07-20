"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Candy, Droplets, Leaf, Shirt, Sparkles } from "lucide-react";
import { ProductImage } from "@/components/shop/product-image";
import type { NavItem } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

type MegaProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  thumbnail?: string | null;
};

const CATEGORY_ICONS = {
  droplets: Droplets,
  leaf: Leaf,
  candy: Candy,
  shirt: Shirt,
  sparkles: Sparkles,
} as const;

type ShopMegaMenuProps = {
  categories: NavItem[];
  open: boolean;
  onNavigate: () => void;
};

export function ShopMegaMenu({ categories, open, onNavigate }: ShopMegaMenuProps) {
  const [products, setProducts] = useState<MegaProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/v1/products?featured=true&limit=4");
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: MegaProduct[];
        };
        if (!cancelled && Array.isArray(json.data)) {
          setProducts(json.data.slice(0, 4));
        }
      } catch {
        /* silent — static categories still render */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  if (!open) return null;

  return (
    <div
      className="z-[70] border-b border-black/[0.06] bg-white shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)]"
      role="menu"
      aria-label="Shop categories"
    >
      <div className="container-rootora py-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-button text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Categories
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-heading">
                  Shop by collection
                </p>
              </div>
              <Link
                href="/shop"
                onClick={onNavigate}
                className="hidden items-center gap-1.5 font-button text-sm font-semibold text-primary transition-colors hover:text-heading sm:inline-flex"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const Icon =
                  CATEGORY_ICONS[
                    (category.icon as keyof typeof CATEGORY_ICONS) ?? "leaf"
                  ] ?? Leaf;

                return (
                  <Link
                    key={category.href}
                    href={category.href}
                    onClick={onNavigate}
                    className="group flex gap-3 rounded-2xl border border-black/[0.05] bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f5]">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary">
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <p className="truncate font-button text-sm font-semibold text-heading transition-colors group-hover:text-primary">
                          {category.label}
                        </p>
                      </div>
                      {category.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mb-5">
              <p className="font-button text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Featured
              </p>
              <p className="mt-1 font-heading text-xl font-semibold text-heading">
                Product preview
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => {
                  const image =
                    product.thumbnail ||
                    product.images?.[0] ||
                    "/images/products/placeholder.png";

                  return (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={onNavigate}
                      className="group overflow-hidden rounded-2xl border border-black/[0.05] bg-white transition-all duration-300 hover:shadow-soft"
                    >
                      <div className="relative aspect-square overflow-hidden bg-white">
                        <div className="absolute inset-3">
                          <ProductImage
                            src={image}
                            alt={product.name}
                            fit="contain"
                            sizes="160px"
                            className="transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 px-3 py-3">
                        <p className="line-clamp-2 font-button text-xs font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
                          {product.name}
                        </p>
                        <p className="text-xs font-semibold tabular-nums text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div
                className={cn(
                  "grid grid-cols-2 gap-3",
                  !loaded && "animate-pulse"
                )}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] rounded-2xl bg-[#f3f3f1]"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
