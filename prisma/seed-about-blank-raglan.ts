import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Flat-lay first (main/thumbnail), then model shots for gallery. */
const IMAGE_FILES = [
  "about-blank-raglan-main.png",
  "about-blank-raglan-front.png",
  "about-blank-raglan-side.png",
  "about-blank-raglan-back.png",
] as const;

const SIZES = [
  { value: "M", stock: 1 },
  { value: "L", stock: 1 },
  { value: "XL", stock: 1 },
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
  const slug = "about-blank-brown-white-raglan-tshirt";
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (existing) {
    await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
    await prisma.product.delete({ where: { id: existing.id } });
    console.log(`Deleted old product: ${existing.name}`);
  }

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
    where: { slug: "t-shirt" },
  });

  if (!category) {
    throw new Error('Category "t-shirt" not found');
  }

  const [thumbnail, ...galleryRest] = uploadedUrls;
  const images = uploadedUrls;
  const totalStock = SIZES.reduce((sum, size) => sum + size.stock, 0);

  const product = await prisma.product.create({
    data: {
      name: 'About Blank Brown & White Raglan T-Shirt',
      slug,
      shortDescription:
        "Color: Chocolate brown body with white raglan sleeves — soft jersey tee with cursive About Blank chest print.",
      description:
        "A classic short-sleeve raglan tee in soft jersey — deep chocolate brown body and collar, crisp white sleeves, and an elegant white “About Blank” script across the chest. Regular everyday fit, breathable cotton feel, and a clean minimalist look that pairs easily with denim or black trousers.\n\n• Style: raglan / baseball tee\n• Colors: brown body, white sleeves\n• Neckline: ribbed crew\n• Sizes: M, L, XL\n• Fabric: soft jersey (cotton blend feel)\n\nMain product shot is a flat-lay of the tee; lifestyle photos of the shirt on a model are in the gallery.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 1090,
      costPrice: 700,
      originalPrice: 1090,
      salePrice: null,
      discountType: null,
      discountAmount: null,
      images,
      thumbnail,
      hoverImage: galleryRest[0] ?? thumbnail,
      categoryId: category.id,
      productType: "physical",
      stockCount: totalStock,
      inStock: true,
      stockStatus: "low_stock",
      lowStockAlert: 5,
      organic: false,
      unit: "piece",
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: [
        "tshirt",
        "raglan",
        "about-blank",
        "mens",
        "cotton",
        "brown",
        "white",
        "clothing",
        "casual",
      ],
      featured: true,
      bestSeller: false,
      newArrival: true,
      freshToday: false,
      seasonal: false,
      collection: "clothing",
      brand: "About Blank",
      ingredients: [],
      allergens: [],
      farmImages: [],
      variants: {
        create: [
          ...SIZES.map((size) => ({
            name: "Size",
            value: size.value,
            stockCount: size.stock,
            sku: `AB-RAGLAN-${size.value}`,
          })),
          {
            name: "Color",
            value: "Brown & White",
            stockCount: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  console.log("\nDone!");
  console.log("Product:", product.name, `(${product.slug})`);
  console.log("Price:", Number(product.price), "| Cost:", Number(product.costPrice));
  console.log("Stock:", product.stockCount, "| Sizes:", product.variants.map((v) => `${v.value}:${v.stockCount}`).join(", "));
  console.log("Images:", product.images.length, "(main = flat-lay)");
  console.log("Live URL: /shop/" + product.slug);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
