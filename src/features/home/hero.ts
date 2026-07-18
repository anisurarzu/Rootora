import {
  DEFAULT_HERO_CONTENT,
  type HeroContent,
  type HeroSlideData,
} from "@/features/home/hero-content";
import { getStorefrontProductsByFlag } from "@/features/products/storefront-queries";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export type { HeroContent, HeroSlideData } from "@/features/home/hero-content";
export { DEFAULT_HERO_CONTENT } from "@/features/home/hero-content";

const HERO_BEST_SELLER_LIMIT = 8;

function productToHeroSlide(product: Product, index: number): HeroSlideData {
  const image = product.images[0] ?? "/images/products/placeholder.png";
  const detailParts = [
    formatPrice(product.price),
    product.unit ? `· ${product.unit}` : null,
  ].filter(Boolean);

  return {
    id: product.id,
    image,
    label: "Best seller",
    title: product.name,
    detail: detailParts.join(" "),
    href: `/shop/${product.slug}`,
    sortOrder: index,
    active: true,
  };
}

async function getBestSellerHeroSlides(): Promise<HeroSlideData[]> {
  const bestSellers = await getStorefrontProductsByFlag(
    "bestSeller",
    HERO_BEST_SELLER_LIMIT
  );
  if (bestSellers.length > 0) {
    return bestSellers.map(productToHeroSlide);
  }

  // Fallback if nothing is flagged yet — still show real catalog products
  const featured = await getStorefrontProductsByFlag(
    "featured",
    HERO_BEST_SELLER_LIMIT
  );
  return featured.map(productToHeroSlide);
}

export async function ensureHeroDefaults() {
  const existing = await prisma.heroSettings.findUnique({
    where: { id: "default" },
    include: { slides: true },
  });

  if (existing) return existing;

  return prisma.heroSettings.create({
    data: {
      id: "default",
      brandName: DEFAULT_HERO_CONTENT.brandName,
      tagline: DEFAULT_HERO_CONTENT.tagline,
      headline: DEFAULT_HERO_CONTENT.headline,
      description: DEFAULT_HERO_CONTENT.description,
      ctaPrimaryLabel: DEFAULT_HERO_CONTENT.ctaPrimaryLabel,
      ctaPrimaryHref: DEFAULT_HERO_CONTENT.ctaPrimaryHref,
      ctaSecondaryLabel: DEFAULT_HERO_CONTENT.ctaSecondaryLabel,
      ctaSecondaryHref: DEFAULT_HERO_CONTENT.ctaSecondaryHref,
      backgroundImage: DEFAULT_HERO_CONTENT.backgroundImage,
      slides: {
        create: DEFAULT_HERO_CONTENT.slides.map((slide, index) => ({
          image: slide.image,
          label: slide.label,
          title: slide.title,
          detail: slide.detail,
          href: slide.href,
          sortOrder: index,
          active: true,
        })),
      },
    },
    include: { slides: true },
  });
}

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const [hero, bestSellerSlides] = await Promise.all([
      ensureHeroDefaults(),
      getBestSellerHeroSlides(),
    ]);

    return {
      brandName: hero.brandName,
      tagline: hero.tagline,
      headline: hero.headline,
      description: hero.description,
      ctaPrimaryLabel: hero.ctaPrimaryLabel,
      ctaPrimaryHref: hero.ctaPrimaryHref,
      ctaSecondaryLabel: hero.ctaSecondaryLabel,
      ctaSecondaryHref: hero.ctaSecondaryHref,
      backgroundImage: hero.backgroundImage,
      slides:
        bestSellerSlides.length > 0
          ? bestSellerSlides
          : DEFAULT_HERO_CONTENT.slides,
    };
  } catch (error) {
    console.error("Failed to load hero content", error);
    return DEFAULT_HERO_CONTENT;
  }
}

export async function getHeroForAdmin() {
  await ensureHeroDefaults();
  return prisma.heroSettings.findUniqueOrThrow({
    where: { id: "default" },
    include: {
      slides: { orderBy: { sortOrder: "asc" } },
    },
  });
}
