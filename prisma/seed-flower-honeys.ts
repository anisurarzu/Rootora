import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type HoneyProduct = {
  slug: string;
  name: string;
  banglaName: string;
  price: number;
  imageFile: string;
  flower: string;
  taste: string;
  color: string;
  featured?: boolean;
  bestSeller?: boolean;
  ingredients: string[];
  nutrition: Record<string, string>;
};

const HONEYS: HoneyProduct[] = [
  {
    slug: "kalojira-flower-honey",
    name: "Kalojira Flower Honey 500g",
    banglaName: "কালোজিরা ফুলের মধু",
    price: 520,
    imageFile: "kalojira-flower-honey.png",
    flower: "kalojira (black cumin) flower",
    taste: "deep, slightly spicy floral notes with a bold finish",
    color: "rich dark amber",
    featured: true,
    bestSeller: true,
    ingredients: ["100% kalojira flower honey"],
    nutrition: {
      "Serving size": "20g (1 tbsp)",
      Energy: "~64 kcal",
      Carbohydrates: "~17g",
      Sugars: "natural floral sugars",
      Protein: "0g",
      Fat: "0g",
      Fiber: "0g",
    },
  },
  {
    slug: "litchi-flower-honey",
    name: "Litchi Flower Honey 500g",
    banglaName: "লিচু ফুলের মধু",
    price: 370,
    imageFile: "litchi-flower-honey.png",
    flower: "litchi flower",
    taste: "light, fruity sweetness with a delicate floral aroma",
    color: "clear light amber",
    featured: true,
    bestSeller: false,
    ingredients: ["100% litchi flower honey"],
    nutrition: {
      "Serving size": "20g (1 tbsp)",
      Energy: "~64 kcal",
      Carbohydrates: "~17g",
      Sugars: "natural floral sugars",
      Protein: "0g",
      Fat: "0g",
      Fiber: "0g",
    },
  },
  {
    slug: "mustard-flower-honey",
    name: "Mustard Flower Honey 500g",
    banglaName: "সরিষা ফুলের মধু",
    price: 330,
    imageFile: "mustard-flower-honey.png",
    flower: "mustard flower",
    taste: "warm golden sweetness with a gentle mustard-bloom aroma",
    color: "golden amber",
    featured: true,
    bestSeller: true,
    ingredients: ["100% mustard flower honey"],
    nutrition: {
      "Serving size": "20g (1 tbsp)",
      Energy: "~64 kcal",
      Carbohydrates: "~17g",
      Sugars: "natural floral sugars",
      Protein: "0g",
      Fat: "0g",
      Fiber: "0g",
    },
  },
];

const KEEP_SLUGS = HONEYS.map((h) => h.slug);

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
  const mime = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

  const blob = new Blob([buffer], { type: mime });
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

async function deleteOrArchiveProduct(productId: string, label: string) {
  await prisma.cartItem.deleteMany({ where: { productId } });
  await prisma.wishlistItem.deleteMany({ where: { productId } });
  await prisma.review.deleteMany({ where: { productId } });
  await prisma.productVariant.deleteMany({ where: { productId } });

  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "ARCHIVED",
        inStock: false,
        stockCount: 0,
        stockStatus: "out_of_stock",
        featured: false,
        bestSeller: false,
      },
    });
    console.log(
      `Archived ${label} (kept for ${orderItemCount} past order item(s))`
    );
    return;
  }

  await prisma.product.delete({ where: { id: productId } });
  console.log(`Deleted ${label}`);
}

function buildDescription(honey: HoneyProduct) {
  return [
    `ROOTORA ${honey.name.replace(" 500g", "")} (${honey.banglaName}) — 100% pure ${honey.flower} honey in a 500g jar.`,
    "",
    `Collected from ${honey.flower} nectar across Bangladesh, this unprocessed honey has a ${honey.color} colour and ${honey.taste}. No added sugar. Naturally Bangladeshi — pure from hive to jar.`,
    "",
    "Specifications",
    "• Net weight: 500g",
    "• Pack: sealed jar with screw cap",
    `• Variety: ${honey.flower} honey`,
    `• Colour: ${honey.color}`,
    "• Grade: 100% pure & natural",
    "• Processing: unprocessed / raw style",
    "• Added sugar: none",
    "• Brand: ROOTORA",
    "• Origin: Bangladesh",
    "",
    "Key features",
    "• 100% Pure & Natural",
    "• No Added Sugar",
    "• Unprocessed",
    "• Rich in Nutrients",
    "",
    "How to enjoy",
    "• Stir into tea or warm milk",
    "• Drizzle on toast, yogurt, or fruit",
    "• Pair with traditional Bangladeshi snacks",
    "",
    "Storage",
    "Store in a cool, dry place away from direct sunlight. Do not refrigerate. Natural crystallization may occur — place the jar in warm water to gently reliquefy.",
  ].join("\n");
}

async function main() {
  const assetsDir = path.join(process.cwd(), "assets");

  const category = await prisma.category.findUnique({
    where: { slug: "honey" },
  });
  if (!category) {
    throw new Error('Honey category not found. Run seed-starter-catalog first.');
  }

  // Remove every honey product that is not one of the three new packs
  const existingHoney = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      slug: { notIn: KEEP_SLUGS },
    },
    select: { id: true, name: true, slug: true },
  });

  for (const product of existingHoney) {
    await deleteOrArchiveProduct(
      product.id,
      `${product.name} (${product.slug})`
    );
  }

  // Also clear old mustard if we're replacing with same slug via upsert — keep slug
  console.log("\nUploading images & upserting products...\n");

  for (const honey of HONEYS) {
    const imagePath = path.join(assetsDir, honey.imageFile);
    console.log(`Uploading ${honey.imageFile}...`);
    const imageUrl = await uploadToCloudinary(imagePath, honey.imageFile);
    console.log(`  → ${imageUrl}`);

    const description = buildDescription(honey);
    const shortDescription = `${honey.banglaName} — 100% pure ${honey.flower} honey in a 500g jar.`;

    const product = await prisma.product.upsert({
      where: { slug: honey.slug },
      update: {
        name: honey.name,
        shortDescription,
        description,
        productStory: `Harvested from ${honey.flower} blooms across Bangladesh, ${honey.banglaName} brings authentic ROOTORA quality to your pantry — ${honey.color}, ${honey.taste}.`,
        status: "PUBLISHED",
        publishedAt: new Date(),
        price: honey.price,
        originalPrice: honey.price,
        salePrice: null,
        images: [imageUrl],
        thumbnail: imageUrl,
        hoverImage: imageUrl,
        ogImage: imageUrl,
        categoryId: category.id,
        productType: "physical",
        stockCount: 25,
        inStock: true,
        stockStatus: "in_stock",
        lowStockAlert: 5,
        organic: true,
        unit: "500g jar",
        weight: 0.5,
        origin: "Bangladesh",
        country: "Bangladesh",
        originBadge: "Naturally Bangladeshi",
        tags: [
          "honey",
          honey.slug.split("-")[0]!,
          "flower-honey",
          "organic",
          "natural",
          "500g",
          "pantry",
          "rootora",
        ],
        featured: Boolean(honey.featured),
        bestSeller: Boolean(honey.bestSeller),
        freshToday: false,
        seasonal: false,
        newArrival: true,
        collection: "pantry",
        brand: "ROOTORA",
        ingredients: honey.ingredients,
        allergens: [],
        nutrition: honey.nutrition,
        shelfLife: "24 months from packing (unopened)",
        farmImages: [],
        storageInstruction:
          "Store in a cool, dry place away from direct sunlight. Do not refrigerate. Natural crystallization may occur — warm gently in water to reliquefy.",
        seoTitle: `${honey.name} | ROOTORA`,
        seoDescription: shortDescription,
        sku: `HNY-${honey.slug.toUpperCase().replace(/-/g, "").slice(0, 12)}`,
      },
      create: {
        name: honey.name,
        slug: honey.slug,
        shortDescription,
        description,
        productStory: `Harvested from ${honey.flower} blooms across Bangladesh, ${honey.banglaName} brings authentic ROOTORA quality to your pantry — ${honey.color}, ${honey.taste}.`,
        status: "PUBLISHED",
        publishedAt: new Date(),
        price: honey.price,
        originalPrice: honey.price,
        images: [imageUrl],
        thumbnail: imageUrl,
        hoverImage: imageUrl,
        ogImage: imageUrl,
        categoryId: category.id,
        productType: "physical",
        stockCount: 25,
        inStock: true,
        stockStatus: "in_stock",
        lowStockAlert: 5,
        organic: true,
        unit: "500g jar",
        weight: 0.5,
        origin: "Bangladesh",
        country: "Bangladesh",
        originBadge: "Naturally Bangladeshi",
        tags: [
          "honey",
          honey.slug.split("-")[0]!,
          "flower-honey",
          "organic",
          "natural",
          "500g",
          "pantry",
          "rootora",
        ],
        featured: Boolean(honey.featured),
        bestSeller: Boolean(honey.bestSeller),
        freshToday: false,
        seasonal: false,
        newArrival: true,
        collection: "pantry",
        brand: "ROOTORA",
        ingredients: honey.ingredients,
        allergens: [],
        nutrition: honey.nutrition,
        shelfLife: "24 months from packing (unopened)",
        farmImages: [],
        storageInstruction:
          "Store in a cool, dry place away from direct sunlight. Do not refrigerate. Natural crystallization may occur — warm gently in water to reliquefy.",
        seoTitle: `${honey.name} | ROOTORA`,
        seoDescription: shortDescription,
        sku: `HNY-${honey.slug.toUpperCase().replace(/-/g, "").slice(0, 12)}`,
      },
    });

    console.log(
      `✓ ${product.name} — ৳${product.price} → /shop/${product.slug}\n`
    );
  }

  // Point honey category image at mustard jar for a real product look
  const mustard = await prisma.product.findUnique({
    where: { slug: "mustard-flower-honey" },
    select: { thumbnail: true },
  });
  if (mustard?.thumbnail) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        image: mustard.thumbnail,
        description:
          "Pure Bangladeshi flower honeys — kalojira, litchi & mustard — 500g jars.",
      },
    });
    console.log("Updated honey category image & description.");
  }

  console.log("Done. Three honey products are live in the database.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
