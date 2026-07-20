import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  const mime = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
    ? "image/jpeg"
    : "image/png";

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

async function uploadAsset(fileName: string) {
  const filePath = path.join(process.cwd(), "assets", fileName);
  console.log(`Uploading ${fileName}...`);
  const url = await uploadToCloudinary(filePath, fileName);
  console.log(`  → ${url}`);
  return url;
}

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  imageFile: string;
};

type ProductSeed = {
  name: string;
  slug: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice: number;
  unit: string;
  tags: string[];
  collection: string;
  organic: boolean;
  featured: boolean;
  seasonal: boolean;
  imageFiles: string[];
};

const CATEGORIES: CategorySeed[] = [
  {
    name: "Sweets",
    slug: "sweets",
    description:
      "Traditional Bangladeshi mishti — rosogolla, sandesh, and festive sweets made with care.",
    imageFile: "category-sweets.png",
  },
  {
    name: "Traditional Clothing",
    slug: "traditional-clothing",
    description:
      "Handcrafted Punjabi and heritage Bangladeshi wear — comfort, craft, and everyday elegance.",
    imageFile: "category-traditional-clothing.png",
  },
  {
    name: "T-shirt",
    slug: "t-shirt",
    description:
      "Soft everyday cotton tees — simple cuts, breathable fabric, made for Bangladesh weather.",
    imageFile: "category-tshirt.png",
  },
  {
    name: "Honey",
    slug: "honey",
    description:
      "প্রাকৃতিক মধু, সুস্থ জীবনের প্রতিশ্রুতি — বিশুদ্ধ সরিষা, কালোজিরা ও লিচু ফুলের মধু।",
    imageFile: "category-honey.jpg",
  },
  {
    name: "Seasonal Fruits",
    slug: "seasonal-fruits",
    description:
      "Fresh seasonal fruits of Bangladesh — mangoes and more, picked at peak ripeness.",
    imageFile: "category-seasonal-fruits.png",
  },
];

const PRODUCTS: ProductSeed[] = [
  {
    name: "Black Cotton Punjabi",
    slug: "black-cotton-punjabi",
    categorySlug: "traditional-clothing",
    shortDescription:
      "Classic black Punjabi in breathable cotton — comfortable for daily wear and special occasions.",
    description:
      "A timeless black Punjabi tailored from soft, breathable cotton fabric. Lightweight and comfortable for Bangladesh's climate, with a clean traditional cut that works for prayers, family gatherings, and everyday elegance.",
    price: 1850,
    originalPrice: 2200,
    unit: "piece",
    tags: ["punjabi", "traditional", "mens", "cotton", "black", "clothing"],
    collection: "clothing",
    organic: false,
    featured: true,
    seasonal: false,
    imageFiles: [
      "black-punjabi-front.png",
      "black-punjabi-fabric.png",
      "black-punjabi-side.png",
      "black-punjabi-back.png",
    ],
  },
  {
    name: "Olive Cotton T-Shirt",
    slug: "olive-cotton-tshirt",
    categorySlug: "t-shirt",
    shortDescription:
      "Everyday olive cotton tee — soft, breathable, and easy to style.",
    description:
      "A clean-cut olive green cotton t-shirt designed for everyday comfort. Soft hand-feel, breathable fabric, and a relaxed fit that works for casual wear across Bangladesh seasons.",
    price: 890,
    originalPrice: 1100,
    unit: "piece",
    tags: ["tshirt", "cotton", "mens", "casual", "olive", "clothing"],
    collection: "clothing",
    organic: false,
    featured: true,
    seasonal: false,
    imageFiles: ["product-tshirt-main.png", "product-tshirt-detail.png"],
  },
  {
    name: "Mustard Flower Honey 500g",
    slug: "mustard-flower-honey",
    categorySlug: "honey",
    shortDescription:
      "সরিষা ফুলের মধু — 100% pure mustard flower honey in a 500g jar.",
    description:
      "ROOTORA Mustard Flower Honey (সরিষা ফুলের মধু) is 100% pure and natural honey collected from mustard flower nectar. This 500g jar is unprocessed, with no added sugar — rich in natural nutrients and a warm floral taste.\n\nEnjoy with tea, toast, yogurt, or traditional Bangladeshi snacks. Naturally Bangladeshi — pure from hive to jar.\n\n• 100% Pure & Natural\n• No Added Sugar\n• Unprocessed\n• Rich in Nutrients\n• Net weight: 500g",
    price: 350,
    originalPrice: 350,
    unit: "500g jar",
    tags: ["honey", "mustard", "mustard-flower", "organic", "natural", "500g", "pantry"],
    collection: "pantry",
    organic: true,
    featured: true,
    seasonal: false,
    imageFiles: ["mustard-flower-honey.jpg"],
  },
  {
    name: "Fresh Langra Mango",
    slug: "fresh-langra-mango",
    categorySlug: "seasonal-fruits",
    shortDescription:
      "Seasonal Langra mangoes — fragrant, juicy, and picked at peak ripeness.",
    description:
      "Fresh Langra mangoes sourced in season for their signature aroma and sweet-tart pulp. Ideal for eating fresh, salads, or traditional mango desserts. Delivered when fruit is at its best.",
    price: 420,
    originalPrice: 500,
    unit: "kg",
    tags: ["mango", "langra", "fruit", "seasonal", "fresh"],
    collection: "produce",
    organic: true,
    featured: true,
    seasonal: true,
    imageFiles: ["product-mango-main.png", "product-mango-detail.png"],
  },
];

async function main() {
  const uploaded = new Map<string, string>();

  const allFiles = [
    ...CATEGORIES.map((c) => c.imageFile),
    ...PRODUCTS.flatMap((p) => p.imageFiles),
  ];
  const uniqueFiles = [...new Set(allFiles)];

  for (const file of uniqueFiles) {
    uploaded.set(file, await uploadAsset(file));
  }

  const categoryIds = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const image = uploaded.get(cat.imageFile)!;
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image,
      },
    });
    categoryIds.set(cat.slug, row.id);
    console.log(`Category ready: ${row.name}`);
  }

  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category: ${product.categorySlug}`);
    }

    const images = product.imageFiles.map((file) => uploaded.get(file)!);
    const thumbnail = images[0]!;
    const hoverImage = images[1] ?? thumbnail;

    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        status: "PUBLISHED",
        publishedAt: new Date(),
        price: product.price,
        originalPrice: product.originalPrice,
        images,
        thumbnail,
        hoverImage,
        categoryId,
        productType: "physical",
        stockCount: product.slug === "mustard-flower-honey" ? 10 : 30,
        inStock: true,
        stockStatus: "in_stock",
        organic: product.organic,
        unit: product.unit,
        origin: "Bangladesh",
        country: "Bangladesh",
        tags: product.tags,
        featured: product.featured,
        seasonal: product.seasonal,
        collection: product.collection,
        brand: "ROOTORA",
        ingredients: [],
        allergens: [],
        farmImages: [],
      },
      create: {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        status: "PUBLISHED",
        publishedAt: new Date(),
        price: product.price,
        originalPrice: product.originalPrice,
        images,
        thumbnail,
        hoverImage,
        categoryId,
        productType: "physical",
        stockCount: product.slug === "mustard-flower-honey" ? 10 : 30,
        inStock: true,
        stockStatus: "in_stock",
        organic: product.organic,
        unit: product.unit,
        origin: "Bangladesh",
        country: "Bangladesh",
        tags: product.tags,
        featured: product.featured,
        seasonal: product.seasonal,
        collection: product.collection,
        brand: "ROOTORA",
        ingredients: [],
        allergens: [],
        farmImages: [],
      },
    });

    console.log(`Product ready: ${row.name} → /shop/${row.slug}`);
  }

  console.log("\nDone — 5 categories + 5 demo products live in the database.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
