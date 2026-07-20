import { FREE_SHIPPING_THRESHOLD } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

export type HeroSlideData = {
  id: string;
  image: string;
  label: string;
  title: string;
  detail: string;
  href: string;
  sortOrder: number;
  active: boolean;
};

export type HeroContent = {
  brandName: string;
  tagline: string;
  headline: string;
  description: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  backgroundImage: string;
  slides: HeroSlideData[];
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  brandName: "ROOTORA",
  tagline: "Naturally Bangladeshi.",
  headline: "From Bangladeshi farms to your table",
  description:
    "Organic foods and artisan goods, sourced directly from local farmers.",
  ctaPrimaryLabel: "Shop collection",
  ctaPrimaryHref: "/shop",
  ctaSecondaryLabel: "Meet our farmers",
  ctaSecondaryHref: "/farmers",
  backgroundImage: "/images/hero-produce-original.png",
  slides: [
    {
      id: "gift",
      image: "/images/gift-box.png",
      label: "Latest offer",
      title: "Premium gift hampers",
      detail: `Free delivery over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
      href: "/collections/gift-boxes",
      sortOrder: 0,
      active: true,
    },
    {
      id: "honey",
      image: "/images/products/honey.png",
      label: "Best seller",
      title: "Sundarbans wild honey",
      detail: "Pure mangrove harvest",
      href: "/shop/sundarbans-wild-honey",
      sortOrder: 1,
      active: true,
    },
    {
      id: "mango",
      image: "/images/products/mango.png",
      label: "Seasonal",
      title: "Langra mangoes",
      detail: "From Rajshahi orchards",
      href: "/shop/langra-mango-premium",
      sortOrder: 2,
      active: true,
    },
    {
      id: "organic",
      image: "/images/organic-honey-banner.png",
      label: "Organic staples",
      title: "Honey & mustard oil",
      detail: "Certified & traceable",
      href: "/collections/organic",
      sortOrder: 3,
      active: true,
    },
    {
      id: "spices",
      image: "/images/products/spices.png",
      label: "New arrival",
      title: "Artisan spice set",
      detail: "Hand-milled blends",
      href: "/shop",
      sortOrder: 4,
      active: true,
    },
  ],
};
