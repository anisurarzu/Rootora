import type { Product } from "@prisma/client";

export function serializeProduct(
  product: Product & {
    category?: { id: string; name: string; slug: string } | null;
    farmer?: { id: string; name: string; slug: string } | null;
    variants?: Array<{
      id: string;
      name: string;
      value: string;
      image: string | null;
      price: unknown;
      salePrice: unknown;
      stockCount: number;
      sku: string | null;
    }>;
    _count?: { reviews: number };
  }
) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    productStory: product.productStory,
    status: product.status,
    price: Number(product.price),
    salePrice: product.salePrice != null ? Number(product.salePrice) : null,
    originalPrice:
      product.originalPrice != null ? Number(product.originalPrice) : null,
    images: product.images,
    thumbnail: product.thumbnail ?? product.images[0] ?? null,
    hoverImage: product.hoverImage,
    videoUrl: product.videoUrl,
    unit: product.unit,
    brand: product.brand,
    tags: product.tags,
    organic: product.organic,
    featured: product.featured,
    trending: product.trending,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    inStock: product.inStock,
    stockCount: product.stockCount,
    stockStatus: product.stockStatus,
    codAvailable: product.codAvailable,
    freeShipping: product.freeShipping,
    minOrderQty: product.minOrderQty,
    maxOrderQty: product.maxOrderQty,
    origin: product.origin,
    country: product.country,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    farmer: product.farmer
      ? {
          id: product.farmer.id,
          name: product.farmer.name,
          slug: product.farmer.slug,
        }
      : null,
    variants: (product.variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      value: variant.value,
      image: variant.image,
      price: variant.price != null ? Number(variant.price) : null,
      salePrice: variant.salePrice != null ? Number(variant.salePrice) : null,
      stockCount: variant.stockCount,
      sku: variant.sku,
    })),
    reviewCount: product._count?.reviews ?? 0,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
