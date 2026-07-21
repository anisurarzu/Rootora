"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlashSaleSidebar } from "@/features/home/flash-sale-sidebar";
import {
  DEFAULT_FLASH_SALE_CONTENT,
  type FlashSaleContent,
} from "@/features/home/flash-sale-content";
import {
  DEFAULT_HERO_CONTENT,
  type HeroContent,
  type HeroSlideData,
} from "@/features/home/hero-content";
import { cn } from "@/lib/utils";

const SLIDE_MS = 5000;

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

type HeroSectionProps = {
  content?: HeroContent;
  flashSale?: FlashSaleContent;
};

export function HeroSection({
  content = DEFAULT_HERO_CONTENT,
  flashSale = { ...DEFAULT_FLASH_SALE_CONTENT, products: [] },
}: HeroSectionProps) {
  const slides = content.slides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((prev) => wrapIndex(prev + 1, slides.length));
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const safeActive = wrapIndex(active, slides.length);

  return (
    <section aria-label={`${content.brandName} hero`} className="bg-[#eef1ea]">
      <div
        className="container-rootora pt-[0.5px] pb-2.5 sm:pb-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grid gap-2.5 lg:grid-cols-12 lg:gap-3">
          <div className="relative overflow-hidden bg-white py-[2.5px] shadow-soft lg:col-span-9">
            <div className="relative aspect-[16/7] overflow-hidden sm:aspect-[16/6] lg:aspect-[16/5.5]">
              {slides.length === 0 ? (
                <div className="relative h-full w-full bg-[#f4f6f2]">
                  {content.backgroundImage ? (
                    <Image
                      src={content.backgroundImage}
                      alt={content.headline || content.brandName}
                      fill
                      priority
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <p className="font-heading text-2xl font-semibold text-heading">
                        {content.headline || content.brandName}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <motion.div
                    className="flex h-full"
                    animate={{ x: `-${safeActive * 100}%` }}
                    transition={{ type: "spring", stiffness: 280, damping: 30 }}
                  >
                    {slides.map((slide) => (
                      <div
                        key={slide.id}
                        className="relative h-full w-full shrink-0"
                      >
                        <HeroBannerSlide slide={slide} />
                      </div>
                    ))}
                  </motion.div>

                  {slides.length > 1 ? (
                    <>
                      <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {slides.map((slide, index) => (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={`Show ${slide.title}`}
                            aria-current={index === safeActive}
                            onClick={() => setActive(index)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              index === safeActive
                                ? "w-5 bg-white"
                                : "w-1.5 bg-white/50 hover:bg-white/80",
                            )}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:flex"
                        onClick={() =>
                          setActive((prev) =>
                            wrapIndex(prev - 1, slides.length),
                          )
                        }
                        aria-label="Previous slide"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:flex"
                        onClick={() =>
                          setActive((prev) =>
                            wrapIndex(prev + 1, slides.length),
                          )
                        }
                        aria-label="Next slide"
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {flashSale.enabled && flashSale.products.length > 0 ? (
            <aside className="hidden lg:col-span-3 lg:block">
              <FlashSaleSidebar content={flashSale} />
            </aside>
          ) : null}
        </div>

        {flashSale.enabled && flashSale.products.length > 0 ? (
          <div className="mt-2.5 lg:hidden">
            <FlashSaleSidebar content={flashSale} layout="grid" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroBannerSlide({ slide }: { slide: HeroSlideData }) {
  return (
    <Link
      href={slide.href}
      className="group relative block h-full w-full overflow-hidden"
      aria-label={`${slide.title} — ${slide.detail}`}
    >
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
        sizes="(max-width: 1024px) 100vw, 70vw"
        unoptimized={
          slide.image.startsWith("/") ||
          (slide.image.startsWith("http") &&
            !slide.image.includes("res.cloudinary.com"))
        }
      />
    </Link>
  );
}
