import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMAGE_FILES = [
  "white-punjabi-front.png",
  "white-punjabi-fabric.png",
  "white-punjabi-side.png",
  "white-punjabi-back.png",
] as const;

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
    const details = await response.text();
    throw new Error(`Cloudinary upload failed for ${fileName}: ${details}`);
  }

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}

async function main() {
  const assetsDir = path.join(process.cwd(), "assets");
  const uploadedUrls: string[] = [];

  for (const fileName of IMAGE_FILES) {
    const filePath = path.join(assetsDir, fileName);
    console.log(`Uploading ${fileName}...`);
    const url = await uploadToCloudinary(filePath, fileName);
    uploadedUrls.push(url);
    console.log(`  → ${url}`);
  }

  const category = await prisma.category.findUnique({
    where: { slug: "traditional-clothing" },
  });

  if (!category) {
    throw new Error("Traditional Clothing category not found");
  }

  const [thumbnail, ...galleryRest] = uploadedUrls;
  const images = uploadedUrls;

  const product = await prisma.product.upsert({
    where: { slug: "white-cotton-punjabi" },
    update: {
      name: "White Cotton Punjabi",
      shortDescription:
        "Classic white Punjabi in breathable cotton — fresh, elegant, and perfect for daily wear or special occasions.",
      description:
        "A timeless white Punjabi tailored from soft, breathable cotton fabric. Crisp and clean for Bangladesh's climate, with a traditional cut that works for prayers, family gatherings, Eid, and everyday elegance. Pair with pajama or formal trousers for a complete look.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 1850,
      originalPrice: 2200,
      images,
      thumbnail,
      hoverImage: galleryRest[0] ?? thumbnail,
      categoryId: category.id,
      productType: "physical",
      stockCount: 25,
      inStock: true,
      stockStatus: "in_stock",
      organic: false,
      unit: "piece",
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: ["punjabi", "traditional", "mens", "cotton", "white", "clothing"],
      featured: true,
      bestSeller: false,
      freshToday: false,
      seasonal: false,
      collection: "clothing",
      brand: "ROOTORA",
      ingredients: [],
      allergens: [],
      farmImages: [],
    },
    create: {
      name: "White Cotton Punjabi",
      slug: "white-cotton-punjabi",
      shortDescription:
        "Classic white Punjabi in breathable cotton — fresh, elegant, and perfect for daily wear or special occasions.",
      description:
        "A timeless white Punjabi tailored from soft, breathable cotton fabric. Crisp and clean for Bangladesh's climate, with a traditional cut that works for prayers, family gatherings, Eid, and everyday elegance. Pair with pajama or formal trousers for a complete look.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 1850,
      originalPrice: 2200,
      images,
      thumbnail,
      hoverImage: galleryRest[0] ?? thumbnail,
      categoryId: category.id,
      productType: "physical",
      stockCount: 25,
      inStock: true,
      stockStatus: "in_stock",
      organic: false,
      unit: "piece",
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: ["punjabi", "traditional", "mens", "cotton", "white", "clothing"],
      featured: true,
      collection: "clothing",
      brand: "ROOTORA",
      ingredients: [],
      allergens: [],
      farmImages: [],
    },
  });

  console.log("\nDone!");
  console.log("Product:", product.name, `(${product.slug})`);
  console.log("Images:", product.images.length);
  console.log("Live URL: /shop/white-cotton-punjabi");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
