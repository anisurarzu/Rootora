"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_HERO_CONTENT,
  type HeroContent,
  type HeroSlideData,
} from "@/features/home/hero-content";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

type DeckSlot = "left" | "center" | "right";

const SLIDE_MS = 5200;
const moveEase = [0.22, 1, 0.36, 1] as const;
const moveTransition = { duration: 1.05, ease: moveEase };

const SLOT: Record<
  DeckSlot,
  { x: string; y: number; rotate: number; scale: number; zIndex: number; opacity: number }
> = {
  left: { x: "-88%", y: 28, rotate: -8, scale: 0.78, zIndex: 1, opacity: 0.72 },
  center: { x: "-50%", y: 0, rotate: 0, scale: 1, zIndex: 3, opacity: 1 },
  right: { x: "-12%", y: 28, rotate: 8, scale: 0.78, zIndex: 1, opacity: 0.72 },
};

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

type HeroSectionProps = {
  content?: HeroContent;
};

export function HeroSection({ content = DEFAULT_HERO_CONTENT }: HeroSectionProps) {
  const slides = content.slides.length > 0 ? content.slides : DEFAULT_HERO_CONTENT.slides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setActive((prev) => wrapIndex(prev + 1, slides.length));
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  function goTo(index: number) {
    setDirection(
      index > active || (active === slides.length - 1 && index === 0) ? 1 : -1
    );
    setActive(wrapIndex(index, slides.length));
  }

  function step(dir: 1 | -1) {
    setDirection(dir);
    setActive((prev) => wrapIndex(prev + dir, slides.length));
  }

  const safeActive = wrapIndex(active, slides.length);
  const visible =
    slides.length === 0
      ? []
      : slides.length === 1
        ? [{ slide: slides[0]!, slot: "center" as const }]
        : slides.length === 2
          ? [
              { slide: slides[wrapIndex(safeActive - 1, slides.length)]!, slot: "left" as const },
              { slide: slides[safeActive]!, slot: "center" as const },
            ]
          : [
              {
                slide: slides[wrapIndex(safeActive - 1, slides.length)]!,
                slot: "left" as const,
              },
              { slide: slides[safeActive]!, slot: "center" as const },
              {
                slide: slides[wrapIndex(safeActive + 1, slides.length)]!,
                slot: "right" as const,
              },
            ];

  return (
    <section
      className="relative w-full max-w-[100vw] overflow-hidden bg-[#122016]"
      aria-label={`${content.brandName} hero`}
    >
      <div className="absolute inset-0">
        <Image
          src={content.backgroundImage}
          alt=""
          fill
          priority
          className="object-cover object-[center_28%] lg:object-center"
          sizes="100vw"
          unoptimized={content.backgroundImage.startsWith("/")}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0f1c12] via-[#122016]/88 to-[#122016]/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0f1c12]/90 via-transparent to-[#122016]/40"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-7 px-4 py-10 sm:gap-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:px-8 lg:py-14">
        <motion.div
          className="order-2 max-w-lg lg:order-1"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="font-heading text-[2rem] font-semibold leading-none tracking-[0.03em] text-[#FEFCF3] sm:text-5xl"
          >
            {content.brandName}
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="mt-2 font-button text-[10px] font-medium uppercase tracking-[0.22em] text-[#A9B388] sm:text-xs sm:tracking-[0.28em]"
          >
            {content.tagline}
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="mt-4 font-heading text-[1.375rem] font-semibold leading-snug text-[#FEFCF3] text-balance sm:mt-5 sm:text-4xl sm:leading-[1.12]"
          >
            {content.headline}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-3 max-w-md text-sm leading-relaxed text-[#FEFCF3]/85 sm:text-base"
          >
            {content.description}
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-5 flex w-full flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3"
          >
            <Button
              size="lg"
              className="h-11 w-full bg-[#FEFCF3] text-[#355E3B] hover:bg-white sm:h-12 sm:w-auto"
              asChild
            >
              <Link href={content.ctaPrimaryHref}>
                {content.ctaPrimaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full border-[#FEFCF3]/45 bg-transparent text-[#FEFCF3] hover:border-[#FEFCF3] hover:bg-[#FEFCF3]/10 hover:text-[#FEFCF3] sm:h-12 sm:w-auto"
              asChild
            >
              <Link href={content.ctaSecondaryHref}>
                {content.ctaSecondaryLabel}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <div
          className="order-1 flex flex-col items-center lg:order-2 lg:items-end"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative mx-auto h-[345px] w-full max-w-[350px] sm:h-[395px] sm:max-w-[410px] lg:mx-0 lg:h-[420px] lg:max-w-[430px]">
            <AnimatePresence initial={false} custom={direction}>
              {visible.map(({ slide, slot }) => (
                <ProductDeckCard
                  key={slide.id}
                  slide={slide}
                  slot={slot}
                  direction={direction}
                  onSelect={() => {
                    if (slot === "left") step(-1);
                    if (slot === "right") step(1);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {slides.length > 1 ? (
            <div className="mt-5 flex gap-1.5">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show ${item.title}`}
                  aria-current={index === safeActive}
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === safeActive
                      ? "w-5 bg-[#FEFCF3]"
                      : "w-1.5 bg-[#FEFCF3]/35 hover:bg-[#FEFCF3]/65"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProductDeckCard({
  slide,
  slot,
  direction,
  onSelect,
}: {
  slide: HeroSlideData;
  slot: DeckSlot;
  direction: number;
  onSelect: () => void;
}) {
  const target = SLOT[slot];
  const featured = slot === "center";

  return (
    <motion.div
      layout={false}
      custom={direction}
      initial={
        direction > 0
          ? { x: "15%", y: 36, rotate: 12, scale: 0.72, opacity: 0, zIndex: 0 }
          : { x: "-115%", y: 36, rotate: -12, scale: 0.72, opacity: 0, zIndex: 0 }
      }
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotate,
        scale: target.scale,
        opacity: target.opacity,
        zIndex: target.zIndex,
      }}
      exit={
        direction > 0
          ? { x: "-120%", y: 40, rotate: -12, scale: 0.7, opacity: 0, zIndex: 0 }
          : { x: "20%", y: 40, rotate: 12, scale: 0.7, opacity: 0, zIndex: 0 }
      }
      transition={moveTransition}
      className={cn(
        "absolute left-1/2 top-0 w-[68%] overflow-hidden rounded-2xl border sm:w-[66%]",
        featured
          ? "border-white/35 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
          : "border-white/15 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)] cursor-pointer"
      )}
      style={{ zIndex: target.zIndex }}
    >
      {featured ? (
        <Link
          href={slide.href}
          className="group relative block aspect-[3/4] w-full"
          aria-label={slide.title}
        >
          <CardMedia slide={slide} featured />
        </Link>
      ) : (
        <button
          type="button"
          className="relative block aspect-[3/4] w-full"
          onClick={onSelect}
          aria-label={`Show ${slide.title}`}
        >
          <CardMedia slide={slide} featured={false} />
        </button>
      )}
    </motion.div>
  );
}

function CardMedia({
  slide,
  featured,
}: {
  slide: HeroSlideData;
  featured: boolean;
}) {
  return (
    <>
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        className="object-cover object-center"
        sizes="(max-width: 640px) 42vw, 220px"
        priority={featured}
        unoptimized={slide.image.startsWith("/")}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/25"
        aria-hidden
      />
      {featured ? (
        <>
          <div
            className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
            <p className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-button text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C5D4A0] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              {slide.label}
            </p>
            <p className="mt-1.5 font-heading text-base font-semibold leading-tight text-white sm:text-lg">
              {slide.title}
            </p>
            <p className="mt-0.5 text-[11px] text-white/80">{slide.detail}</p>
            <span className="mt-2 inline-flex items-center gap-1 font-button text-[11px] font-medium text-white">
              View offer
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      )}
    </>
  );
}
