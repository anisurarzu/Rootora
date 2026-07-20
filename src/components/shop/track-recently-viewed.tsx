"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

type TrackRecentlyViewedProps = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
};

export function TrackRecentlyViewed(product: TrackRecentlyViewedProps) {
  useEffect(() => {
    addRecentlyViewed(product);
  }, [product.id, product.name, product.slug, product.image, product.price]);

  return null;
}
