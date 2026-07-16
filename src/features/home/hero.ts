import {
  DEFAULT_HERO_CONTENT,
  type HeroContent,
} from "@/features/home/hero-content";
import { prisma } from "@/lib/prisma";

export type { HeroContent, HeroSlideData } from "@/features/home/hero-content";
export { DEFAULT_HERO_CONTENT } from "@/features/home/hero-content";

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
    const hero = await ensureHeroDefaults();
    const slides = await prisma.heroSlide.findMany({
      where: { heroId: "default", active: true },
      orderBy: { sortOrder: "asc" },
    });

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
        slides.length > 0
          ? slides.map((slide) => ({
              id: slide.id,
              image: slide.image,
              label: slide.label,
              title: slide.title,
              detail: slide.detail,
              href: slide.href,
              sortOrder: slide.sortOrder,
              active: slide.active,
            }))
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
