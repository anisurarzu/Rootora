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
  const slides =
    content.slides.length > 0 ? content.slides : DEFAULT_HERO_CONTENT.slides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    if (!isDesktop || paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setActive((prev) => wrapIndex(prev + 1, slides.length));
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [isDesktop, paused, slides.length]);

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
              {
                slide: slides[wrapIndex(safeActive - 1, slides.length)]!,
                slot: "left" as const,
              },
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
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: moveEase }}
        >
          <Image
            src={content.backgroundImage}
            alt=""
            fill
            priority
            className="object-cover object-[center_32%] lg:object-center"
            sizes="100vw"
            unoptimized={content.backgroundImage.startsWith("/")}
            aria-hidden
          />
        </motion.div>
        {/* Mobile: richer vertical wash so text sits cleanly without deck */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0f1c12]/55 via-[#122016]/72 to-[#0f1c12] lg:hidden"
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden bg-gradient-to-r from-[#0f1c12] via-[#122016]/88 to-[#122016]/55 lg:block"
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden bg-gradient-to-t from-[#0f1c12]/90 via-transparent to-[#122016]/40 lg:block"
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#A9B388]/25 blur-3xl lg:hidden"
          animate={{ opacity: [0.35, 0.55, 0.35], y: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -right-10 bottom-28 h-44 w-44 rounded-full bg-[#FEFCF3]/12 blur-3xl lg:hidden"
          animate={{ opacity: [0.2, 0.4, 0.2], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      </div>

      {/* —— Mobile / tablet —— */}
      <div className="relative z-10 mx-auto w-full max-w-7xl lg:hidden">
        {slides.length > 0 ? <HangingSwingOffer slides={slides} /> : null}

        <div className="relative z-10 px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-8">
          <motion.div
            className="w-full max-w-[68%] sm:max-w-[66%]"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeInUp}
              className="font-heading text-[2.35rem] font-semibold leading-none tracking-[0.02em] text-[#FEFCF3] sm:text-5xl"
            >
              {content.brandName}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="mt-2.5 font-button text-[10px] font-medium uppercase tracking-[0.26em] text-[#A9B388] sm:text-xs sm:tracking-[0.3em]"
            >
              {content.tagline}
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-3 h-px w-14 origin-left bg-[#A9B388]/80"
            />
            <motion.h1
              variants={fadeInUp}
              className="mt-5 font-heading text-[1.35rem] font-semibold leading-snug text-[#FEFCF3] text-balance sm:text-[1.75rem] sm:leading-[1.15]"
            >
              {content.headline}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-3 text-sm leading-relaxed text-[#FEFCF3]/82 sm:text-[0.95rem]"
            >
              {content.description}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-7 flex w-full flex-col gap-2.5"
            >
              <Button
                size="lg"
                className="h-11 w-full bg-[#FEFCF3] text-[#355E3B] hover:bg-white sm:h-12"
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
                className="h-11 w-full border-[#FEFCF3]/45 bg-transparent text-[#FEFCF3] hover:border-[#FEFCF3] hover:bg-[#FEFCF3]/10 hover:text-[#FEFCF3] sm:h-12"
                asChild
              >
                <Link href={content.ctaSecondaryHref}>
                  {content.ctaSecondaryLabel}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* —— Desktop: copy + rotating product deck —— */}
      <div className="relative z-10 mx-auto hidden w-full max-w-7xl items-center gap-8 px-8 py-14 lg:grid lg:grid-cols-2">
        <motion.div
          className="max-w-lg"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="font-heading text-5xl font-semibold leading-none tracking-[0.03em] text-[#FEFCF3]"
          >
            {content.brandName}
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="mt-2 font-button text-xs font-medium uppercase tracking-[0.28em] text-[#A9B388]"
          >
            {content.tagline}
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="mt-5 font-heading text-4xl font-semibold leading-[1.12] text-[#FEFCF3] text-balance"
          >
            {content.headline}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-3 max-w-md text-base leading-relaxed text-[#FEFCF3]/85"
          >
            {content.description}
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-7 flex gap-3">
            <Button
              size="lg"
              className="h-12 bg-[#FEFCF3] text-[#355E3B] hover:bg-white"
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
              className="h-12 border-[#FEFCF3]/45 bg-transparent text-[#FEFCF3] hover:border-[#FEFCF3] hover:bg-[#FEFCF3]/10 hover:text-[#FEFCF3]"
              asChild
            >
              <Link href={content.ctaSecondaryHref}>
                {content.ctaSecondaryLabel}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <div
          className="flex flex-col items-end"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-[420px] w-full max-w-[430px]">
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

function HangingSwingOffer({ slides }: { slides: HeroSlideData[] }) {
  /** Full pendulum before next product (slow) */
  const FULL_SWING_MS = 7000;
  const SWING_HALF_S = FULL_SWING_MS / 2000;
  const SPIN_S = 1.85;
  const [index, setIndex] = useState(0);
  const [spinTurns, setSpinTurns] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((prev) => wrapIndex(prev + 1, slides.length));
      setSpinTurns((turns) => turns + 1);
    }, FULL_SWING_MS);
    return () => window.clearInterval(id);
  }, [slides.length, reduceMotion]);

  const slide = slides[wrapIndex(index, slides.length)];
  if (!slide) return null;

  return (
    <div className="pointer-events-none absolute right-2 top-0 z-20 w-[118px] sm:right-4 sm:w-[132px]">
      <motion.div
        className="flex origin-top flex-col items-center"
        style={{ transformOrigin: "50% 0%" }}
        animate={reduceMotion ? { rotate: -4 } : { rotate: [-11, 11] }}
        transition={
          reduceMotion
            ? { duration: 0.5 }
            : {
                duration: SWING_HALF_S,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }
        }
      >
        <div className="relative flex h-40 w-px flex-col items-center sm:h-44">
          <span className="absolute top-0 z-10 h-2 w-2 -translate-y-1/2 rounded-full border border-white/40 bg-[#FEFCF3] shadow-[0_0_12px_rgba(254,252,243,0.55)]" />
          <span className="h-full w-px bg-gradient-to-b from-[#FEFCF3]/80 via-[#A9B388]/45 to-[#FEFCF3]/25" />
        </div>

        <div
          className="relative -mt-0.5 aspect-square w-full"
          style={{ perspective: 1000 }}
        >
          {/* Same card always visible — slow 360° spin on change, no fade */}
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: reduceMotion ? 0 : spinTurns * 360 }}
            transition={{
              duration: reduceMotion ? 0 : SPIN_S,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={slide.href}
              className="pointer-events-auto relative block h-full w-full overflow-hidden rounded-full border border-white/45 bg-[#1a2a1e]/40 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/20"
              aria-label={`${slide.title} — ${slide.detail}`}
            >
              <Image
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center"
                sizes="132px"
                priority
                unoptimized={slide.image.startsWith("/")}
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/80"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 px-2 pb-2.5 pt-6 text-center">
                <p className="font-button text-[7px] font-semibold uppercase tracking-[0.12em] text-[#C5D4A0]">
                  {slide.label}
                </p>
                <p className="mt-0.5 line-clamp-2 font-heading text-[11px] font-semibold leading-tight text-white sm:text-xs">
                  {slide.title}
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
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
        "absolute left-1/2 top-0 w-[66%] overflow-hidden rounded-2xl border",
        featured
          ? "border-white/35 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
          : "cursor-pointer border-white/15 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
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
        sizes="220px"
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
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-button text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C5D4A0] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              {slide.label}
            </p>
            <p className="mt-1.5 font-heading text-lg font-semibold leading-tight text-white">
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
