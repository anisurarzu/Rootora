"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/features/cart/store/cart-store";
import {
  FREE_SHIPPING_THRESHOLD,
  calculateShipping,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container-rootora section-padding text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-6 font-heading text-3xl font-semibold text-heading">
            Your cart is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover our premium collection of Bangladeshi products.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Cart"
          title="Shopping Cart"
          description={`${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
          align="left"
        />

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <article
                key={product.id}
                className="flex gap-4 rounded-xl border border-border bg-surface p-4 shadow-soft sm:gap-6 sm:p-6"
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/shop/${product.slug}`}
                        className="font-heading text-lg font-medium text-heading hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.unit}
                      </p>
                    </div>
                    <p className="font-button font-semibold text-primary">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-9 w-8 items-center justify-center text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="h-fit rounded-xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="font-heading text-xl font-semibold text-heading">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-secondary">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free delivery
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-button text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>

            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="ghost" className="mt-2 w-full" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
