import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMAGE_FILE = "mustard-flower-honey.jpg";
const NEW_SLUG = "mustard-flower-honey";
const OLD_HONEY_SLUGS = ["pure-sundarbans-honey", "sundarbans-wild-honey"];

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

  const blob = new Blob([buffer], { type: "image/jpeg" });
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

async function deleteProductById(productId: string, label: string) {
  await prisma.cartItem.deleteMany({ where: { productId } });
  await prisma.wishlistItem.deleteMany({ where: { productId } });
  await prisma.review.deleteMany({ where: { productId } });
  await prisma.productVariant.deleteMany({ where: { productId } });

  // Keep historical order rows; unlink by deleting product only if no order items.
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

async function main() {
  const assetsDir = path.join(process.cwd(), "assets");
  const imagePath = path.join(assetsDir, IMAGE_FILE);

  console.log(`Uploading ${IMAGE_FILE}...`);
  const imageUrl = await uploadToCloudinary(imagePath, IMAGE_FILE);
  console.log(`  → ${imageUrl}`);

  const category = await prisma.category.findUnique({
    where: { slug: "honey" },
  });

  if (!category) {
    throw new Error('Honey category not found. Run seed-starter-catalog first.');
  }

  // Remove placeholder / old honey products (by slug + any other honey SKUs except the new one)
  const oldBySlug = await prisma.product.findMany({
    where: { slug: { in: OLD_HONEY_SLUGS } },
    select: { id: true, name: true, slug: true },
  });

  const otherHoney = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      slug: { not: NEW_SLUG },
    },
    select: { id: true, name: true, slug: true },
  });

  const toRemove = new Map(
    [...oldBySlug, ...otherHoney].map((p) => [p.id, p])
  );

  for (const product of toRemove.values()) {
    await deleteProductById(product.id, `${product.name} (${product.slug})`);
  }

  const product = await prisma.product.upsert({
    where: { slug: NEW_SLUG },
    update: {
      name: "Mustard Flower Honey 500g",
      shortDescription:
        "সরিষা ফুলের মধু — 100% pure mustard flower honey in a 500g jar.",
      description:
        "ROOTORA Mustard Flower Honey (সরিষা ফুলের মধু) is 100% pure and natural honey collected from mustard flower nectar. This 500g jar is unprocessed, with no added sugar — rich in natural nutrients and a warm floral taste.\n\nEnjoy with tea, toast, yogurt, or traditional Bangladeshi snacks. Naturally Bangladeshi — pure from hive to jar.\n\n• 100% Pure & Natural\n• No Added Sugar\n• Unprocessed\n• Rich in Nutrients\n• Net weight: 500g",
      productStory:
        "Harvested from mustard flower blooms across Bangladesh, this honey carries the golden color and gentle aroma of সরিষা ফুল — a pantry staple for everyday wellness.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 350,
      originalPrice: 350,
      salePrice: null,
      images: [imageUrl],
      thumbnail: imageUrl,
      hoverImage: imageUrl,
      categoryId: category.id,
      productType: "physical",
      stockCount: 10,
      inStock: true,
      stockStatus: "in_stock",
      lowStockAlert: 3,
      organic: true,
      unit: "500g jar",
      weight: 0.5,
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: [
        "honey",
        "mustard",
        "mustard-flower",
        "organic",
        "natural",
        "500g",
        "pantry",
      ],
      featured: true,
      bestSeller: true,
      freshToday: false,
      seasonal: false,
      collection: "pantry",
      brand: "ROOTORA",
      ingredients: ["100% mustard flower honey"],
      allergens: [],
      farmImages: [],
      storageInstruction:
        "Store in a cool, dry place away from direct sunlight. Do not refrigerate. Natural crystallization may occur — place the jar in warm water to reliquefy.",
    },
    create: {
      name: "Mustard Flower Honey 500g",
      slug: NEW_SLUG,
      shortDescription:
        "সরিষা ফুলের মধু — 100% pure mustard flower honey in a 500g jar.",
      description:
        "ROOTORA Mustard Flower Honey (সরিষা ফুলের মধু) is 100% pure and natural honey collected from mustard flower nectar. This 500g jar is unprocessed, with no added sugar — rich in natural nutrients and a warm floral taste.\n\nEnjoy with tea, toast, yogurt, or traditional Bangladeshi snacks. Naturally Bangladeshi — pure from hive to jar.\n\n• 100% Pure & Natural\n• No Added Sugar\n• Unprocessed\n• Rich in Nutrients\n• Net weight: 500g",
      productStory:
        "Harvested from mustard flower blooms across Bangladesh, this honey carries the golden color and gentle aroma of সরিষা ফুল — a pantry staple for everyday wellness.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 350,
      originalPrice: 350,
      images: [imageUrl],
      thumbnail: imageUrl,
      hoverImage: imageUrl,
      categoryId: category.id,
      productType: "physical",
      stockCount: 10,
      inStock: true,
      stockStatus: "in_stock",
      lowStockAlert: 3,
      organic: true,
      unit: "500g jar",
      weight: 0.5,
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: [
        "honey",
        "mustard",
        "mustard-flower",
        "organic",
        "natural",
        "500g",
        "pantry",
      ],
      featured: true,
      bestSeller: true,
      freshToday: false,
      seasonal: false,
      collection: "pantry",
      brand: "ROOTORA",
      ingredients: ["100% mustard flower honey"],
      allergens: [],
      farmImages: [],
      storageInstruction:
        "Store in a cool, dry place away from direct sunlight. Do not refrigerate. Natural crystallization may occur — place the jar in warm water to reliquefy.",
    },
  });

  console.log(`\nProduct ready: ${product.name}`);
  console.log(`  Price: ৳${product.price} | Stock: ${product.stockCount}`);
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
