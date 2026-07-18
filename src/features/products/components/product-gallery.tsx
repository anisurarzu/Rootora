"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ScanSearch, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRODUCT_PLACEHOLDER } from "@/components/shop/product-image";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

const MAIN_LENS_SIZE = 168;
const MAIN_ZOOM = 3.5;
const INSPECT_LENS_SIZE = 220;
const INSPECT_ZOOM = 5.5;

function imageProps(url: string) {
  const isRemote = url.startsWith("http");
  return {
    unoptimized: isRemote && !url.includes("res.cloudinary.com"),
  };
}

type LensState = {
  x: number;
  y: number;
  visible: boolean;
};

type ContainerSize = {
  width: number;
  height: number;
};

type MagnifierLensProps = {
  src: string;
  alt: string;
  lensSize: number;
  zoomFactor: number;
  className?: string;
  hint?: string;
};

function MagnifierLens({
  src,
  alt,
  lensSize,
  zoomFactor,
  className,
  hint = "Drag to inspect fabric",
}: MagnifierLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const [lens, setLens] = useState<LensState>({ x: 0, y: 0, visible: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const updateLens = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    setSize({ width: rect.width, height: rect.height });
    setLens({ x, y, visible: true });
  }, []);

  const hideLens = useCallback(() => {
    setLens((current) => ({ ...current, visible: false }));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) updateLens(touch.clientX, touch.clientY);
    };

    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [updateLens]);

  const lensLeft = lens.x - lensSize / 2;
  const lensTop = lens.y - lensSize / 2;
  const zoomedWidth = size.width * zoomFactor;
  const zoomedHeight = size.height * zoomFactor;
  const zoomedLeft = -(lens.x * zoomFactor - lensSize / 2);
  const zoomedTop = -(lens.y * zoomFactor - lensSize / 2);

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate select-none touch-none", className)}
      onMouseMove={(event) => updateLens(event.clientX, event.clientY)}
      onMouseEnter={(event) => updateLens(event.clientX, event.clientY)}
      onMouseLeave={hideLens}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (touch) updateLens(touch.clientX, touch.clientY);
      }}
      onTouchEnd={hideLens}
      onTouchCancel={hideLens}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="pointer-events-none object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        draggable={false}
        {...imageProps(src)}
      />

      {!lens.visible && (
        <span className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <ScanSearch className="h-3.5 w-3.5" />
          {hint}
        </span>
      )}

      {lens.visible && size.width > 0 && (
        <>
          <div
            className="pointer-events-none absolute z-30 overflow-hidden rounded-full border-[3px] border-white bg-black shadow-[0_10px_40px_rgba(0,0,0,0.45)] ring-2 ring-primary/50"
            style={{
              width: lensSize,
              height: lensSize,
              left: lensLeft,
              top: lensTop,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute max-w-none object-cover"
              style={{
                width: zoomedWidth,
                height: zoomedHeight,
                left: zoomedLeft,
                top: zoomedTop,
              }}
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/15" />
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
          </div>
          <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {zoomFactor}× close-up · drag to move
          </p>
        </>
      )}
    </div>
  );
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [PRODUCT_PLACEHOLDER];
  const [activeIndex, setActiveIndex] = useState(0);
  const [inspectOpen, setInspectOpen] = useState(false);

  const activeImage = gallery[activeIndex] ?? gallery[0]!;

  function selectImage(index: number) {
    setActiveIndex(index);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted shadow-soft">
          <MagnifierLens
            key={activeImage}
            src={activeImage}
            alt={name}
            lensSize={MAIN_LENS_SIZE}
            zoomFactor={MAIN_ZOOM}
            className="h-full w-full"
            hint="Drag to inspect"
          />
          <button
            type="button"
            onClick={() => setInspectOpen(true)}
            className="absolute left-3 top-3 z-40 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75"
            aria-label={`Open full fabric inspector for ${name}`}
          >
            <ZoomIn className="h-3.5 w-3.5" />
            Full inspect
          </button>
        </div>

        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((img, index) => (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`View image ${index + 1} of ${gallery.length}`}
                aria-current={activeIndex === index}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all",
                  activeIndex === index
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border hover:border-primary/40"
                )}
              >
                <Image
                  src={img}
                  alt={`${name} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                  {...imageProps(img)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
        <DialogContent className="max-h-[92vh] w-[min(96vw,56rem)] max-w-[96vw] gap-0 overflow-hidden border-none bg-[#0f1410] p-3 sm:p-4 [&>button]:text-white [&>button]:hover:text-white/80">
          <DialogTitle className="sr-only">
            {name} — fabric microscope inspector
          </DialogTitle>

          <div className="flex items-center justify-between gap-3 pb-3">
            <p className="truncate text-sm font-medium text-white/90">
              {name}
              {gallery.length > 1 ? ` · ${activeIndex + 1}/${gallery.length}` : ""}
            </p>
            <p className="shrink-0 text-xs text-white/60">
              {INSPECT_ZOOM}× microscope · drag lens
            </p>
          </div>

          <div className="relative aspect-square max-h-[calc(92vh-8rem)] w-full overflow-hidden rounded-xl bg-black/40">
            <MagnifierLens
              key={`inspect-${activeImage}`}
              src={activeImage}
              alt={`${name} fabric detail`}
              lensSize={INSPECT_LENS_SIZE}
              zoomFactor={INSPECT_ZOOM}
              className="h-full w-full"
              hint="Drag for extreme close-up"
            />
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, index) => (
                <button
                  key={`inspect-${img}-${index}`}
                  type="button"
                  onClick={() => selectImage(index)}
                  className={cn(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2",
                    activeIndex === index
                      ? "border-white"
                      : "border-white/25 hover:border-white/50"
                  )}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                    {...imageProps(img)}
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
