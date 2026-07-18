import type { Prisma } from "@prisma/client";
import type { Category, Farmer, Product } from "@/types";
import { prisma } from "@/lib/prisma";

const PLACEHOLDER_IMAGE = "/images/products/placeholder.png";
const PLACEHOLDER_CATEGORY = "/images/categories/placeholder.png";

export const publishedProductInclude = {
  category: true,
  farmer: true,
  variants: { orderBy: { value: "asc" } },
  reviews: { select: { rating: true } },
  _count: { select: { reviews: true } },
} satisfies Prisma.ProductInclude;

type DbProduct = Prisma.ProductGetPayload<{
  include: typeof publishedProductInclude;
}>;

type DbCategory = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

const publishedWhere = { status: "PUBLISHED" as const };

function productImages(product: {
  images: string[];
  thumbnail: string | null;
}): string[] {
  if (product.images.length > 0) return product.images;
  if (product.thumbnail) return [product.thumbnail];
  return [PLACEHOLDER_IMAGE];
}

function averageRating(
  reviews: { rating: number }[],
  reviewCount: number
): number {
  if (reviewCount <= 0 || reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviewCount) * 10) / 10;
}

export function mapDbCategoryToStorefront(
  category: DbCategory,
  publishedCount?: number
): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? PLACEHOLDER_CATEGORY,
    productCount: publishedCount ?? category._count.products,
  };
}

export function mapDbFarmerToStorefront(
  farmer: NonNullable<DbProduct["farmer"]>,
  productCount = 0
): Farmer {
  return {
    id: farmer.id,
    name: farmer.name,
    slug: farmer.slug,
    village: farmer.village,
    district: farmer.district,
    story: farmer.story,
    image: farmer.image ?? PLACEHOLDER_IMAGE,
    gallery: farmer.gallery ?? [],
    productCount,
    verified: farmer.verified,
  };
}

export function mapDbProductToStorefront(product: DbProduct): Product {
  const reviewCount = product._count.reviews;
  const price = Number(product.salePrice ?? product.price);
  const originalPrice =
    product.originalPrice != null ? Number(product.originalPrice) : undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription ?? "",
    price,
    originalPrice:
      originalPrice != null && originalPrice > price ? originalPrice : undefined,
    images: productImages(product),
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      description: product.category.description ?? "",
      image: product.category.image ?? PLACEHOLDER_CATEGORY,
      productCount: 0,
    },
    farmer: product.farmer
      ? mapDbFarmerToStorefront(product.farmer)
      : undefined,
    rating: averageRating(product.reviews, reviewCount),
    reviewCount,
    inStock: product.inStock,
    stockCount: product.stockCount,
    organic: product.organic,
    tags: product.tags,
    unit: product.unit ?? "piece",
    origin: product.origin ?? product.country ?? "Bangladesh",
    brand: product.brand ?? undefined,
    ingredients: product.ingredients ?? [],
    storageInstruction: product.storageInstruction ?? undefined,
    shelfLife: product.shelfLife ?? undefined,
    nutrition:
      product.nutrition &&
      typeof product.nutrition === "object" &&
      !Array.isArray(product.nutrition)
        ? Object.fromEntries(
            Object.entries(product.nutrition as Record<string, unknown>).map(
              ([key, value]) => [key, String(value)]
            )
          )
        : undefined,
    featured: product.featured,
    bestSeller: product.bestSeller,
    freshToday: product.freshToday,
    seasonal: product.seasonal,
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
  };
}

export async function getStorefrontCategories(options?: {
  onlyWithProducts?: boolean;
}): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: { where: publishedWhere },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Clothing-first for ROOTORA's main focus
  const categoryPriority: Record<string, number> = {
    "traditional-clothing": 0,
    "t-shirt": 1,
    honey: 2,
    sweets: 3,
    "seasonal-fruits": 4,
  };

  const mapped = categories
    .map((category) => mapDbCategoryToStorefront(category))
    .sort((a, b) => {
      const aRank = categoryPriority[a.slug] ?? 50;
      const bRank = categoryPriority[b.slug] ?? 50;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });

  if (options?.onlyWithProducts) {
    return mapped.filter((category) => category.productCount > 0);
  }

  return mapped;
}

export type ShopQueryParams = {
  category?: string;
  q?: string;
  sort?: string;
  filter?: string;
};

function shopOrderBy(
  sort?: string
): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "popular":
      return { reviews: { _count: "desc" } };
    case "newest":
      return { publishedAt: "desc" };
    default:
      return { updatedAt: "desc" };
  }
}

export async function getStorefrontProducts(
  params: ShopQueryParams = {}
): Promise<Product[]> {
  const where: Prisma.ProductWhereInput = {
    ...publishedWhere,
    ...(params.category
      ? { category: { slug: params.category } }
      : {}),
    ...(params.filter === "fresh-today" ? { freshToday: true } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            {
              shortDescription: {
                contains: params.q,
                mode: "insensitive",
              },
            },
            { description: { contains: params.q, mode: "insensitive" } },
            { tags: { has: params.q } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: shopOrderBy(params.sort),
    include: publishedProductInclude,
  });

  return products.map(mapDbProductToStorefront);
}

export async function getStorefrontProductBySlug(
  slug: string
): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { slug, ...publishedWhere },
    include: publishedProductInclude,
  });

  return product ? mapDbProductToStorefront(product) : null;
}

export async function getRelatedStorefrontProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      ...publishedWhere,
      categoryId: product.category.id,
      id: { not: product.id },
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: publishedProductInclude,
  });

  return products.map(mapDbProductToStorefront);
}

export async function getStorefrontProductsByFlag(
  flag: "seasonal" | "freshToday" | "bestSeller" | "organic" | "featured",
  limit?: number
): Promise<Product[]> {
  const where: Prisma.ProductWhereInput = {
    ...publishedWhere,
    ...(flag === "organic" ? { organic: true } : { [flag]: true }),
  };

  const products = await prisma.product.findMany({
    where,
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: publishedProductInclude,
  });

  return products.map(mapDbProductToStorefront);
}

export async function getCollectionStorefrontProducts(
  slug: string
): Promise<{ products: Product[]; isFallback: boolean }> {
  let where: Prisma.ProductWhereInput = publishedWhere;

  switch (slug) {
    case "organic":
      where = { ...publishedWhere, organic: true };
      break;
    case "seasonal":
      where = { ...publishedWhere, seasonal: true };
      break;
    case "gift-boxes":
      where = {
        ...publishedWhere,
        OR: [
          { collection: { equals: "gift-boxes", mode: "insensitive" } },
          { category: { slug: "gift-boxes" } },
          { tags: { has: "gift" } },
        ],
      };
      break;
    case "clothing":
      where = {
        ...publishedWhere,
        OR: [
          { collection: { equals: "clothing", mode: "insensitive" } },
          { category: { slug: "traditional-clothing" } },
        ],
      };
      break;
    case "festival":
      where = { ...publishedWhere, featured: true };
      break;
    case "handmade":
      where = {
        ...publishedWhere,
        OR: [
          { collection: { equals: "handmade", mode: "insensitive" } },
          { tags: { has: "handmade" } },
        ],
      };
      break;
    default:
      return { products: await getStorefrontProducts(), isFallback: true };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: publishedProductInclude,
  });

  return {
    products: products.map(mapDbProductToStorefront),
    isFallback: false,
  };
}
