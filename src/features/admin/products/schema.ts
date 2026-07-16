import { z } from "zod";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function toOptionalNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumber(value: unknown, fallback = 0) {
  if (value === "" || value === undefined || value === null) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const optionalNumber = z.preprocess(
  toOptionalNumber,
  z.number().min(0).nullable().optional()
);

const optionalInt = z.preprocess(
  toOptionalNumber,
  z.number().int().min(0).nullable().optional()
);

const optionalCoord = z.preprocess(
  toOptionalNumber,
  z.number().nullable().optional()
);

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  value: z.string().min(1, "Variant value is required"),
  image: z.string().optional().default(""),
  sku: z.string().optional().default(""),
  price: optionalNumber,
  salePrice: optionalNumber,
  stockCount: z.preprocess((value) => toNumber(value, 0), z.number().int().min(0)),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional().default(""),
  description: z.string().min(10, "Full description is required"),
  productStory: z.string().optional().default(""),
  productType: z.string().optional().default("physical"),
  status: productStatusSchema,
  featured: z.boolean(),
  trending: z.boolean(),
  bestSeller: z.boolean(),
  todaysDeal: z.boolean(),
  newArrival: z.boolean(),
  freshToday: z.boolean(),
  seasonal: z.boolean(),
  limitedEdition: z.boolean(),
  imported: z.boolean(),
  local: z.boolean(),
  organic: z.boolean(),

  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().default(""),
  childCategory: z.string().optional().default(""),
  collection: z.string().optional().default(""),
  brand: z.string().optional().default(""),
  tags: z.array(z.string()),

  price: z.preprocess(
    (value) => toNumber(value, 0),
    z.number().min(0, "Regular price is required")
  ),
  salePrice: optionalNumber,
  originalPrice: optionalNumber,
  costPrice: optionalNumber,
  wholesalePrice: optionalNumber,
  tax: optionalNumber,
  discountType: z.string().optional().default(""),
  discountAmount: optionalNumber,

  sku: z.string().optional().default(""),
  barcode: z.string().optional().default(""),
  stockCount: z.preprocess((value) => toNumber(value, 0), z.number().int().min(0)),
  stockStatus: z.string(),
  lowStockAlert: z.preprocess((value) => toNumber(value, 5), z.number().int().min(0)),
  minOrderQty: z.preprocess((value) => toNumber(value, 1), z.number().int().min(1)),
  maxOrderQty: optionalInt,
  weight: optionalNumber,
  length: optionalNumber,
  width: optionalNumber,
  height: optionalNumber,
  unit: z.string().optional().default(""),

  thumbnail: z.string().optional().default(""),
  images: z.array(z.string()),
  hoverImage: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),

  variants: z.array(productVariantSchema),

  deliveryTime: z.string().optional().default(""),
  shippingClass: z.string().optional().default(""),
  shippingCharge: optionalNumber,
  codAvailable: z.boolean(),
  freeShipping: z.boolean(),
  returnAvailable: z.boolean(),
  replacementAvailable: z.boolean(),

  certificateNumber: z.string().optional().default(""),
  certificateUrl: z.string().optional().default(""),
  harvestDate: z.string().optional().default(""),
  expiryDate: z.string().optional().default(""),
  bestBefore: z.string().optional().default(""),
  storageInstruction: z.string().optional().default(""),

  farmerId: z.string().optional().default(""),
  farmerDistrict: z.string().optional().default(""),
  farmerUpazila: z.string().optional().default(""),
  farmName: z.string().optional().default(""),
  farmStory: z.string().optional().default(""),
  farmImages: z.array(z.string()),

  country: z.string().optional().default("Bangladesh"),
  origin: z.string().optional().default(""),
  originDistrict: z.string().optional().default(""),
  originBadge: z.string().optional().default(""),
  latitude: optionalCoord,
  longitude: optionalCoord,

  calories: z.string().optional().default(""),
  protein: z.string().optional().default(""),
  fat: z.string().optional().default(""),
  carbohydrate: z.string().optional().default(""),
  sugar: z.string().optional().default(""),
  fiber: z.string().optional().default(""),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),

  shelfLife: z.string().optional().default(""),
  freshlyMade: z.boolean(),
  madeDate: z.string().optional().default(""),
  keepRefrigerated: z.boolean(),
  sweetCategory: z.string().optional().default(""),
  deliveryArea: z.string().optional().default(""),

  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  seoKeywords: z.string().optional().default(""),
  canonicalUrl: z.string().optional().default(""),
  ogImage: z.string().optional().default(""),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;

export const emptyProductFormValues: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  productStory: "",
  productType: "physical",
  status: "DRAFT",
  featured: false,
  trending: false,
  bestSeller: false,
  todaysDeal: false,
  newArrival: false,
  freshToday: false,
  seasonal: false,
  limitedEdition: false,
  imported: false,
  local: true,
  organic: false,
  categoryId: "",
  subcategory: "",
  childCategory: "",
  collection: "",
  brand: "",
  tags: [],
  price: 0,
  salePrice: null,
  originalPrice: null,
  costPrice: null,
  wholesalePrice: null,
  tax: null,
  discountType: "",
  discountAmount: null,
  sku: "",
  barcode: "",
  stockCount: 0,
  stockStatus: "in_stock",
  lowStockAlert: 5,
  minOrderQty: 1,
  maxOrderQty: null,
  weight: null,
  length: null,
  width: null,
  height: null,
  unit: "",
  thumbnail: "",
  images: [],
  hoverImage: "",
  videoUrl: "",
  variants: [],
  deliveryTime: "",
  shippingClass: "",
  shippingCharge: null,
  codAvailable: true,
  freeShipping: false,
  returnAvailable: true,
  replacementAvailable: false,
  certificateNumber: "",
  certificateUrl: "",
  harvestDate: "",
  expiryDate: "",
  bestBefore: "",
  storageInstruction: "",
  farmerId: "",
  farmerDistrict: "",
  farmerUpazila: "",
  farmName: "",
  farmStory: "",
  farmImages: [],
  country: "Bangladesh",
  origin: "",
  originDistrict: "",
  originBadge: "",
  latitude: null,
  longitude: null,
  calories: "",
  protein: "",
  fat: "",
  carbohydrate: "",
  sugar: "",
  fiber: "",
  ingredients: [],
  allergens: [],
  shelfLife: "",
  freshlyMade: false,
  madeDate: "",
  keepRefrigerated: false,
  sweetCategory: "",
  deliveryArea: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  ogImage: "",
};
