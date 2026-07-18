import type { Farmer, Product, ProductVariant, Category } from "@prisma/client";
import {
  emptyProductFormValues,
  type ProductFormValues,
} from "@/features/admin/products/schema";

type ProductWithRelations = Product & {
  variants: ProductVariant[];
  category?: Category;
  farmer?: Farmer | null;
};

function dateToInput(value?: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function emptyToNull(value?: string | null) {
  if (!value || !value.trim()) return null;
  return value.trim();
}

function nutritionToFields(nutrition: unknown) {
  if (!nutrition || typeof nutrition !== "object") {
    return {
      calories: "",
      protein: "",
      fat: "",
      carbohydrate: "",
      sugar: "",
      fiber: "",
    };
  }
  const data = nutrition as Record<string, unknown>;
  return {
    calories: String(data.calories ?? ""),
    protein: String(data.protein ?? ""),
    fat: String(data.fat ?? ""),
    carbohydrate: String(data.carbohydrate ?? ""),
    sugar: String(data.sugar ?? ""),
    fiber: String(data.fiber ?? ""),
  };
}

export function productToFormValues(
  product?: ProductWithRelations | null
): ProductFormValues {
  if (!product) return { ...emptyProductFormValues };

  return {
    ...emptyProductFormValues,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description,
    productStory: product.productStory ?? "",
    productType: product.productType ?? "physical",
    status: product.status,
    featured: product.featured,
    trending: product.trending,
    bestSeller: product.bestSeller,
    todaysDeal: product.todaysDeal,
    newArrival: product.newArrival,
    freshToday: product.freshToday,
    seasonal: product.seasonal,
    limitedEdition: product.limitedEdition,
    imported: product.imported,
    local: product.local,
    organic: product.organic,
    categoryId: product.categoryId,
    subcategory: product.subcategory ?? "",
    childCategory: product.childCategory ?? "",
    collection: product.collection ?? "",
    brand: product.brand ?? "",
    tags: product.tags ?? [],
    price: Number(product.price),
    salePrice: product.salePrice != null ? Number(product.salePrice) : null,
    originalPrice:
      product.originalPrice != null ? Number(product.originalPrice) : null,
    costPrice: product.costPrice != null ? Number(product.costPrice) : null,
    wholesalePrice:
      product.wholesalePrice != null ? Number(product.wholesalePrice) : null,
    tax: product.tax != null ? Number(product.tax) : null,
    discountType: product.discountType ?? "",
    discountAmount:
      product.discountAmount != null ? Number(product.discountAmount) : null,
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    stockCount: product.stockCount,
    stockStatus: product.stockStatus,
    lowStockAlert: product.lowStockAlert,
    minOrderQty: product.minOrderQty,
    maxOrderQty: product.maxOrderQty,
    weight: product.weight != null ? Number(product.weight) : null,
    length: product.length != null ? Number(product.length) : null,
    width: product.width != null ? Number(product.width) : null,
    height: product.height != null ? Number(product.height) : null,
    unit: product.unit ?? "",
    thumbnail: product.thumbnail ?? product.images[0] ?? "",
    images: product.images ?? [],
    hoverImage: product.hoverImage ?? "",
    videoUrl: product.videoUrl ?? "",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      value: variant.value,
      image: variant.image ?? "",
      sku: variant.sku ?? "",
      price: variant.price != null ? Number(variant.price) : null,
      salePrice: variant.salePrice != null ? Number(variant.salePrice) : null,
      stockCount: variant.stockCount,
    })),
    deliveryTime: product.deliveryTime ?? "",
    shippingClass: product.shippingClass ?? "",
    shippingCharge:
      product.shippingCharge != null ? Number(product.shippingCharge) : null,
    codAvailable: product.codAvailable,
    freeShipping: product.freeShipping,
    returnAvailable: product.returnAvailable,
    replacementAvailable: product.replacementAvailable,
    certificateNumber: product.certificateNumber ?? "",
    certificateUrl: product.certificateUrl ?? "",
    harvestDate: dateToInput(product.harvestDate),
    expiryDate: dateToInput(product.expiryDate),
    bestBefore: dateToInput(product.bestBefore),
    storageInstruction: product.storageInstruction ?? "",
    farmerId: product.farmerId ?? "",
    farmerDistrict: product.farmerDistrict ?? "",
    farmerUpazila: product.farmerUpazila ?? "",
    farmName: product.farmName ?? "",
    farmStory: product.farmStory ?? "",
    farmImages: product.farmImages ?? [],
    country: product.country ?? "Bangladesh",
    origin: product.origin ?? "",
    originDistrict: product.originDistrict ?? "",
    originBadge: product.originBadge ?? "",
    latitude: product.latitude != null ? Number(product.latitude) : null,
    longitude: product.longitude != null ? Number(product.longitude) : null,
    ...nutritionToFields(product.nutrition),
    ingredients: product.ingredients ?? [],
    allergens: product.allergens ?? [],
    shelfLife: product.shelfLife ?? "",
    freshlyMade: product.freshlyMade,
    madeDate: dateToInput(product.madeDate),
    keepRefrigerated: product.keepRefrigerated,
    sweetCategory: product.sweetCategory ?? "",
    deliveryArea: product.deliveryArea ?? "",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    seoKeywords: product.seoKeywords ?? "",
    canonicalUrl: product.canonicalUrl ?? "",
    ogImage: product.ogImage ?? "",
  };
}

export function formValuesToPrismaData(values: ProductFormValues) {
  const images =
    values.images.length > 0
      ? values.images
      : values.thumbnail
        ? [values.thumbnail]
        : [];

  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    shortDescription: emptyToNull(values.shortDescription),
    description: values.description.trim(),
    productStory: emptyToNull(values.productStory),
    productType: emptyToNull(values.productType),
    status: values.status,
    featured: values.featured,
    trending: values.trending,
    bestSeller: values.bestSeller,
    todaysDeal: values.todaysDeal,
    newArrival: values.newArrival,
    freshToday: values.freshToday,
    seasonal: values.seasonal,
    limitedEdition: values.limitedEdition,
    imported: values.imported,
    local: values.local,
    organic: values.organic,
    categoryId: values.categoryId,
    subcategory: emptyToNull(values.subcategory),
    childCategory: emptyToNull(values.childCategory),
    collection: emptyToNull(values.collection),
    brand: emptyToNull(values.brand),
    tags: values.tags.filter(Boolean),
    price: values.price,
    salePrice: values.salePrice,
    originalPrice:
      values.salePrice != null && values.salePrice < values.price
        ? values.price
        : values.originalPrice ?? null,
    costPrice: values.costPrice,
    wholesalePrice: values.wholesalePrice,
    tax: values.tax,
    discountType: emptyToNull(values.discountType),
    discountAmount: values.discountAmount,
    sku: emptyToNull(values.sku),
    barcode: emptyToNull(values.barcode),
    stockCount: values.stockCount,
    stockStatus: values.stockStatus || "in_stock",
    inStock: values.stockCount > 0 && values.stockStatus !== "out_of_stock",
    lowStockAlert: values.lowStockAlert,
    minOrderQty: values.minOrderQty,
    maxOrderQty: values.maxOrderQty,
    weight: values.weight,
    length: values.length,
    width: values.width,
    height: values.height,
    unit: emptyToNull(values.unit),
    thumbnail: emptyToNull(values.thumbnail) ?? images[0] ?? null,
    images,
    hoverImage: emptyToNull(values.hoverImage),
    videoUrl: emptyToNull(values.videoUrl),
    deliveryTime: emptyToNull(values.deliveryTime),
    shippingClass: emptyToNull(values.shippingClass),
    shippingCharge: values.shippingCharge,
    codAvailable: values.codAvailable,
    freeShipping: values.freeShipping,
    returnAvailable: values.returnAvailable,
    replacementAvailable: values.replacementAvailable,
    certificateNumber: emptyToNull(values.certificateNumber),
    certificateUrl: emptyToNull(values.certificateUrl),
    harvestDate: parseOptionalDate(values.harvestDate),
    expiryDate: parseOptionalDate(values.expiryDate),
    bestBefore: parseOptionalDate(values.bestBefore),
    storageInstruction: emptyToNull(values.storageInstruction),
    farmerId: emptyToNull(values.farmerId),
    farmerDistrict: emptyToNull(values.farmerDistrict),
    farmerUpazila: emptyToNull(values.farmerUpazila),
    farmName: emptyToNull(values.farmName),
    farmStory: emptyToNull(values.farmStory),
    farmImages: values.farmImages.filter(Boolean),
    country: emptyToNull(values.country) ?? "Bangladesh",
    origin: emptyToNull(values.origin),
    originDistrict: emptyToNull(values.originDistrict),
    originBadge: emptyToNull(values.originBadge),
    latitude: values.latitude,
    longitude: values.longitude,
    nutrition: {
      calories: values.calories || null,
      protein: values.protein || null,
      fat: values.fat || null,
      carbohydrate: values.carbohydrate || null,
      sugar: values.sugar || null,
      fiber: values.fiber || null,
    },
    ingredients: values.ingredients.filter(Boolean),
    allergens: values.allergens.filter(Boolean),
    shelfLife: emptyToNull(values.shelfLife),
    freshlyMade: values.freshlyMade,
    madeDate: parseOptionalDate(values.madeDate),
    keepRefrigerated: values.keepRefrigerated,
    sweetCategory: emptyToNull(values.sweetCategory),
    deliveryArea: emptyToNull(values.deliveryArea),
    seoTitle: emptyToNull(values.seoTitle),
    seoDescription: emptyToNull(values.seoDescription),
    seoKeywords: emptyToNull(values.seoKeywords),
    canonicalUrl: emptyToNull(values.canonicalUrl),
    ogImage: emptyToNull(values.ogImage),
  };
}
