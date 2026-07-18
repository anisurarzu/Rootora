"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const PRODUCT_PLACEHOLDER = "/images/products/placeholder.png";

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** cover crops to fill; contain shows the full product (jars, bottles). */
  fit?: "cover" | "contain";
}

export function ProductImage({
  src,
  alt,
  priority,
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw",
  fit = "cover",
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || PRODUCT_PLACEHOLDER);

  useEffect(() => {
    setImgSrc(src || PRODUCT_PLACEHOLDER);
  }, [src]);

  const isRemote = imgSrc.startsWith("http");

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      className={cn(
        fit === "contain" ? "object-contain object-center" : "object-cover",
        className
      )}
      sizes={sizes}
      unoptimized={isRemote && !imgSrc.includes("res.cloudinary.com")}
      onError={() => {
        if (imgSrc !== PRODUCT_PLACEHOLDER) {
          setImgSrc(PRODUCT_PLACEHOLDER);
        }
      }}
    />
  );
}

export { PRODUCT_PLACEHOLDER };
