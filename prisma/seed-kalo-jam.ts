import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "kalo-jam";
const IMAGE_FILE = "kalo-jam.png";

function cloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

async function uploadToCloudinary(filePath: string, fileName: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured in .env");
  }

  const buffer = await readFile(filePath);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "rootora/products";
  const signature = cloudinarySignature({ folder, timestamp }, apiSecret);

  const blob = new Blob([buffer], { type: "image/png" });
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error(
      `Cloudinary upload failed for ${fileName}: ${await response.text()}`
    );
  }

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}

async function main() {
  const chamCham = await prisma.product.findUnique({
    where: { slug: "porabari-cham-cham" },
  });
  if (!chamCham) {
    throw new Error("Porabari Cham Cham product not found — seed that first.");
  }

  const filePath = path.join(process.cwd(), "assets", IMAGE_FILE);
  console.log(`Uploading ${IMAGE_FILE}...`);
  const imageUrl = await uploadToCloudinary(filePath, IMAGE_FILE);
  console.log(`  → ${imageUrl}`);

  const name = "Kalo Jam 1kg";
  const shortDescription =
    "Classic কালোজাম — dark, syrupy, and soft. Same care as our Porabari Cham Cham.";
  const description = [
    "ROOTORA Kalo Jam (কালোজাম) — deep, glossy sweets soaked in light syrup.",
    "",
    "Prepared and packed with the same care as our Porabari Cham Cham line — perfect for guests, gifting, and festive occasions.",
    "",
    "Specifications",
    "• Product: Kalo Jam",
    "• Net weight: sold per kg (1kg pack)",
    `• Price: ৳${Number(chamCham.salePrice ?? chamCham.price)} / kg (list ৳${Number(chamCham.originalPrice ?? chamCham.price)})`,
    "• Brand: ROOTORA",
    "",
    "Why ROOTORA",
    "• Soft sponge soaked in syrup — rich colour and classic taste",
    "• Handled and served with care for freshness and presentation",
    "• Perfect for guests, gifting, and festive occasions",
    "",
    "Storage",
    "Keep refrigerated. Best enjoyed chilled within a few days of delivery. Soft sponge soaked in light syrup — handle gently.",
  ].join("\n");

  const price = Number(chamCham.price);
  const originalPrice = Number(chamCham.originalPrice ?? chamCham.price);
  const salePrice =
    chamCham.salePrice != null ? Number(chamCham.salePrice) : null;
  const discountAmount =
    chamCham.discountAmount != null ? Number(chamCham.discountAmount) : null;

  const product = await prisma.product.upsert({
    where: { slug: SLUG },
    update: {
      name,
      shortDescription,
      description,
      productStory:
        "Kalo Jam is a Bangladeshi mishti classic — dark, syrupy, and made for sharing. ROOTORA brings it to your door with the same packing care as our Cham Cham.",
      status: "PUBLISHED",
      publishedAt: chamCham.publishedAt ?? new Date(),
      price,
      originalPrice,
      salePrice,
      discountType: chamCham.discountType,
      discountAmount,
      images: [imageUrl],
      thumbnail: imageUrl,
      hoverImage: imageUrl,
      ogImage: imageUrl,
      categoryId: chamCham.categoryId,
      productType: chamCham.productType,
      stockCount: chamCham.stockCount,
      inStock: chamCham.inStock,
      stockStatus: chamCham.stockStatus,
      lowStockAlert: chamCham.lowStockAlert,
      minOrderQty: chamCham.minOrderQty,
      maxOrderQty: chamCham.maxOrderQty,
      organic: chamCham.organic,
      unit: chamCham.unit,
      weight: chamCham.weight,
      origin: chamCham.origin,
      country: chamCham.country,
      originDistrict: chamCham.originDistrict,
      originBadge: "Tangail",
      tags: [
        "sweets",
        "kalo-jam",
        "kalojam",
        "mishti",
        "dessert",
        "1kg",
      ],
      featured: chamCham.featured,
      trending: chamCham.trending,
      bestSeller: chamCham.bestSeller,
      freshToday: chamCham.freshToday,
      todaysDeal: chamCham.todaysDeal,
      newArrival: true,
      seasonal: chamCham.seasonal,
      limitedEdition: chamCham.limitedEdition,
      imported: chamCham.imported,
      local: chamCham.local,
      freshlyMade: chamCham.freshlyMade,
      keepRefrigerated: chamCham.keepRefrigerated,
      sweetCategory: "kalo-jam",
      collection: chamCham.collection,
      brand: chamCham.brand,
      ingredients: ["chhana (milk solids)", "sugar syrup"],
      allergens: chamCham.allergens,
      shelfLife: chamCham.shelfLife,
      farmImages: [],
      storageInstruction: chamCham.storageInstruction,
      farmName: chamCham.farmName,
      farmStory:
        "Packed with the same care as our Porabari Cham Cham sweets collection.",
      farmerDistrict: chamCham.farmerDistrict,
      seoTitle: "Kalo Jam 1kg | ROOTORA",
      seoDescription: shortDescription,
      sku: "SWT-KALO-JAM-1KG",
      deliveryTime: chamCham.deliveryTime,
      codAvailable: chamCham.codAvailable,
      freeShipping: chamCham.freeShipping,
      returnAvailable: chamCham.returnAvailable,
      replacementAvailable: chamCham.replacementAvailable,
    },
    create: {
      name,
      slug: SLUG,
      shortDescription,
      description,
      productStory:
        "Kalo Jam is a Bangladeshi mishti classic — dark, syrupy, and made for sharing. ROOTORA brings it to your door with the same packing care as our Cham Cham.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price,
      originalPrice,
      salePrice,
      discountType: chamCham.discountType,
      discountAmount,
      images: [imageUrl],
      thumbnail: imageUrl,
      hoverImage: imageUrl,
      ogImage: imageUrl,
      categoryId: chamCham.categoryId,
      productType: chamCham.productType,
      stockCount: chamCham.stockCount,
      inStock: chamCham.inStock,
      stockStatus: chamCham.stockStatus,
      lowStockAlert: chamCham.lowStockAlert,
      minOrderQty: chamCham.minOrderQty,
      maxOrderQty: chamCham.maxOrderQty,
      organic: chamCham.organic,
      unit: chamCham.unit,
      weight: chamCham.weight,
      origin: chamCham.origin,
      country: chamCham.country,
      originDistrict: chamCham.originDistrict,
      originBadge: "Tangail",
      tags: [
        "sweets",
        "kalo-jam",
        "kalojam",
        "mishti",
        "dessert",
        "1kg",
      ],
      featured: chamCham.featured,
      trending: chamCham.trending,
      bestSeller: chamCham.bestSeller,
      freshToday: chamCham.freshToday,
      todaysDeal: chamCham.todaysDeal,
      newArrival: true,
      seasonal: chamCham.seasonal,
      limitedEdition: chamCham.limitedEdition,
      imported: chamCham.imported,
      local: chamCham.local,
      freshlyMade: chamCham.freshlyMade,
      keepRefrigerated: chamCham.keepRefrigerated,
      sweetCategory: "kalo-jam",
      collection: chamCham.collection,
      brand: chamCham.brand,
      ingredients: ["chhana (milk solids)", "sugar syrup"],
      allergens: chamCham.allergens,
      shelfLife: chamCham.shelfLife,
      farmImages: [],
      storageInstruction: chamCham.storageInstruction,
      farmName: chamCham.farmName,
      farmStory:
        "Packed with the same care as our Porabari Cham Cham sweets collection.",
      farmerDistrict: chamCham.farmerDistrict,
      seoTitle: "Kalo Jam 1kg | ROOTORA",
      seoDescription: shortDescription,
      sku: "SWT-KALO-JAM-1KG",
      deliveryTime: chamCham.deliveryTime,
      codAvailable: chamCham.codAvailable,
      freeShipping: chamCham.freeShipping,
      returnAvailable: chamCham.returnAvailable,
      replacementAvailable: chamCham.replacementAvailable,
    },
  });

  console.log(`\n✓ ${product.name}`);
  console.log(
    `  Price: ৳${product.price}${product.salePrice ? ` → ৳${product.salePrice}` : ""} / ${product.unit}`
  );
  console.log(`  Collection: ${product.collection}`);
  console.log(`  URL: /shop/${product.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
