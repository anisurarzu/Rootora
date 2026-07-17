"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
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

function imageProps(url: string) {
  const isRemote = url.startsWith("http");
  return {
    unoptimized: isRemote && !url.includes("res.cloudinary.com"),
  };
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [PRODUCT_PLACEHOLDER];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeImage = gallery[activeIndex] ?? gallery[0]!;

  function selectImage(index: number) {
    setActiveIndex(index);
    setZoomLevel(1);
  }

  function openZoom(index?: number) {
    if (index !== undefined) setActiveIndex(index);
    setZoomLevel(1);
    setZoomOpen(true);
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openZoom()}
          className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-muted shadow-soft"
          aria-label={`View zoomed image of ${name}`}
        >
          <Image
            key={activeImage}
            src={activeImage}
            alt={name}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
            {...imageProps(activeImage)}
          />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors group-hover:bg-black/70">
            <ZoomIn className="h-3.5 w-3.5" />
            Tap to zoom
          </span>
        </button>

        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((img, index) => (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                onDoubleClick={() => openZoom(index)}
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

      <Dialog
        open={zoomOpen}
        onOpenChange={(open) => {
          setZoomOpen(open);
          if (!open) setZoomLevel(1);
        }}
      >
        <DialogContent
          className="max-h-[92vh] w-[min(96vw,56rem)] max-w-[96vw] gap-0 overflow-hidden border-none bg-[#0f1410] p-3 sm:p-4 [&>button]:text-white [&>button]:hover:text-white/80"
        >
          <DialogTitle className="sr-only">{name} — zoomed product view</DialogTitle>

          <div className="flex items-center justify-between gap-3 pb-3">
            <p className="truncate text-sm font-medium text-white/90">
              {name}
              {gallery.length > 1 ? ` · ${activeIndex + 1}/${gallery.length}` : ""}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  zoomLevel === 1
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10"
                )}
              >
                1×
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(2)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  zoomLevel === 2
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10"
                )}
              >
                2×
              </button>
            </div>
          </div>

          <div className="relative max-h-[calc(92vh-7rem)] min-h-[50vh] w-full overflow-auto rounded-xl bg-black/40">
            <div
              className="relative mx-auto min-h-[50vh] w-full transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
            >
              <div className="relative aspect-square w-full min-h-[50vh]">
                <Image
                  src={activeImage}
                  alt={`${name} zoomed`}
                  fill
                  className="object-contain"
                  sizes="96vw"
                  priority
                  {...imageProps(activeImage)}
                />
              </div>
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, index) => (
                <button
                  key={`zoom-${img}-${index}`}
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
