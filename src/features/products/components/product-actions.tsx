"use client";

import { useMemo, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SizeGuide } from "@/features/products/components/size-guide";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import type { Product, ProductVariantOption } from "@/types";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  product: Product;
}

function sizeSortValue(value: string) {
  const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const index = order.indexOf(value.toUpperCase());
  return index === -1 ? 999 : index;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const sizeVariants = useMemo(() => {
    const variants = (product.variants ?? []).filter(
      (variant) => variant.name.toLowerCase() === "size"
    );
    return [...variants].sort(
      (a, b) => sizeSortValue(a.value) - sizeSortValue(b.value)
    );
  }, [product.variants]);

  const colorLabel = useMemo(() => {
    const colorVariant = (product.variants ?? []).find(
      (variant) => variant.name.toLowerCase() === "color"
    );
    return colorVariant?.value ?? null;
  }, [product.variants]);

  const requiresSize = sizeVariants.length > 0;
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const selectedSize = sizeVariants.find((variant) => variant.id === selectedSizeId);

  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const maxQty = selectedSize?.stockCount ?? product.stockCount;
  const canPurchase =
    product.inStock &&
    (!requiresSize || Boolean(selectedSize)) &&
    maxQty > 0;

  function ensureSizeSelected(): ProductVariantOption | null {
    if (!requiresSize) return null;
    if (!selectedSize) {
      toast.error("Please select a size");
      return null;
    }
    if (selectedSize.stockCount <= 0) {
      toast.error("Selected size is out of stock");
      return null;
    }
    return selectedSize;
  }

  const handleAddToCart = () => {
    const size = ensureSizeSelected();
    if (requiresSize && !size) return;

    addToCart(product, quantity, {
      variantId: size?.id,
      variantLabel: size ? `${size.name}: ${size.value}` : undefined,
    });
    toast.success(
      size
        ? `${product.name} (${size.value}) added to cart`
        : `${product.name} added to cart`
    );
  };

  const handleBuyNow = () => {
    const size = ensureSizeSelected();
    if (requiresSize && !size) return;

    addToCart(product, quantity, {
      variantId: size?.id,
      variantLabel: size ? `${size.name}: ${size.value}` : undefined,
    });
    window.location.href = "/checkout";
  };

  return (
    <div className="mt-8 space-y-4">
      {colorLabel ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-button font-medium text-heading">Color</span>
          <span className="text-muted-foreground">{colorLabel}</span>
        </div>
      ) : null}
      {requiresSize ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="font-button text-sm font-medium">Size</p>
              <SizeGuide
                categorySlug={product.category.slug}
                availableSizes={sizeVariants.map((v) => v.value)}
                selectedSize={selectedSize?.value}
              />
            </div>
            {selectedSize ? (
              <p className="text-xs text-muted-foreground">
                {selectedSize.stockCount} left in {selectedSize.value}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Select a size</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant) => {
              const selected = selectedSizeId === variant.id;
              const disabled = variant.stockCount <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedSizeId(variant.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "min-w-11 rounded-lg border px-3 py-2 font-button text-sm font-semibold transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-heading hover:border-primary/40",
                    disabled && "cursor-not-allowed opacity-40 line-through"
                  )}
                  aria-pressed={selected}
                >
                  {variant.value}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 font-button text-sm font-medium">Quantity</p>
        <div className="inline-flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-muted"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-11 w-12 items-center justify-center font-button text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity(Math.min(Math.max(1, maxQty), quantity + 1))
            }
            className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-muted"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2.5 sm:gap-3">
        <Button
          size="lg"
          className="h-14 flex-1 rounded-xl px-4 text-base font-semibold sm:h-12 sm:px-8 sm:text-sm sm:font-medium"
          onClick={handleAddToCart}
          disabled={!canPurchase}
        >
          <ShoppingBag className="h-5 w-5 sm:h-4 sm:w-4" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-14 flex-1 rounded-xl px-4 text-base font-semibold sm:h-12 sm:px-8 sm:text-sm sm:font-medium"
          onClick={handleBuyNow}
          disabled={!canPurchase}
        >
          <Zap className="h-5 w-5 sm:h-4 sm:w-4" />
          Buy Now
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 shrink-0 rounded-xl px-0 sm:h-12 sm:w-12"
          onClick={() => {
            toggleItem(product);
            toast.success(
              inWishlist ? "Removed from wishlist" : "Added to wishlist"
            );
          }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-5 w-5 sm:h-4 sm:w-4",
              inWishlist && "fill-destructive text-destructive"
            )}
          />
        </Button>
      </div>
    </div>
  );
}
