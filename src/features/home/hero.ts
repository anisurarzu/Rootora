import {
  DEFAULT_HERO_CONTENT,
  type HeroContent,
  type HeroSlideData,
} from "@/features/home/hero-content";
import { prisma } from "@/lib/prisma";

export type { HeroContent, HeroSlideData } from "@/features/home/hero-content";
export { DEFAULT_HERO_CONTENT } from "@/features/home/hero-content";

function mapDbSlide(slide: {
  id: string;
  image: string;
  label: string;
  title: string;
  detail: string;
  href: string;
  sortOrder: number;
  active: boolean;
}): HeroSlideData {
  return {
    id: slide.id,
    image: slide.image,
    label: slide.label,
    title: slide.title,
    detail: slide.detail,
    href: slide.href,
    sortOrder: slide.sortOrder,
    active: slide.active,
  };
}

export async function ensureHeroDefaults() {
  const existing = await prisma.heroSettings.findUnique({
    where: { id: "default" },
    include: { slides: { orderBy: { sortOrder: "asc" } } },
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
    include: { slides: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const hero = await ensureHeroDefaults();
    const activeSlides = hero.slides
      .filter((slide) => slide.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapDbSlide);

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
      // Use DB slides only — never resurrect deleted defaults on the live site
      slides: activeSlides,
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
