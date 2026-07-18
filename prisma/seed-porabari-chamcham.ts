import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "porabari-cham-cham";
const IMAGE_FILES = ["porabari-chamcham-1.png", "porabari-chamcham-2.png"];

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

async function main() {
  const assetsDir = path.join(process.cwd(), "assets");

  const category = await prisma.category.findUnique({
    where: { slug: "sweets" },
  });
  if (!category) {
    throw new Error('Sweets category not found.');
  }

  const images: string[] = [];
  for (const fileName of IMAGE_FILES) {
    const filePath = path.join(assetsDir, fileName);
    console.log(`Uploading ${fileName}...`);
    const url = await uploadToCloudinary(filePath, fileName);
    images.push(url);
    console.log(`  → ${url}`);
  }

  const name = "Porabari Cham Cham 1kg";
  const shortDescription =
    "Tangail-famous পোড়াবাড়ি চমচম — sourced from Gouro Gosh, served fresh to your door.";
  const description = [
    "ROOTORA Porabari Cham Cham (পোড়াবাড়ি চমচম) from Tangail — soft, syrupy, and coated in fine mawa crumbs.",
    "",
    "We collect this legendary sweet from Gouro Gosh, one of Tangail’s most loved mishti shops, and pack it carefully so you get that authentic Porabari taste at home.",
    "",
    "Specifications",
    "• Product: Porabari Cham Cham (Tangail)",
    "• Net weight: sold per kg (1kg pack)",
    "• Price: ৳350 / kg",
    "• Source shop: Gouro Gosh, Tangail",
    "• Origin: Porabari / Tangail, Bangladesh",
    "• Brand: ROOTORA",
    "",
    "Why ROOTORA",
    "• Collected from one of Tangail’s best Cham Cham shops",
    "• Handled and served with care for freshness and presentation",
    "• Perfect for guests, gifting, and festive occasions",
    "",
    "Storage",
    "Keep refrigerated. Best enjoyed chilled within a few days of delivery. Soft sponge soaked in light syrup — handle gently.",
  ].join("\n");

  const product = await prisma.product.upsert({
    where: { slug: SLUG },
    update: {
      name,
      shortDescription,
      description,
      productStory:
        "Porabari Cham Cham is Tangail’s pride. ROOTORA partners with Gouro Gosh — a trusted local shop — and brings you the same beloved taste, packed and served the ROOTORA way.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 350,
      originalPrice: 350,
      salePrice: null,
      images,
      thumbnail: images[0],
      hoverImage: images[1] ?? images[0],
      ogImage: images[0],
      categoryId: category.id,
      productType: "physical",
      stockCount: 30,
      inStock: true,
      stockStatus: "in_stock",
      lowStockAlert: 5,
      organic: false,
      unit: "kg",
      weight: 1,
      origin: "Tangail, Bangladesh",
      country: "Bangladesh",
      originDistrict: "Tangail",
      originBadge: "Porabari · Tangail",
      tags: [
        "sweets",
        "cham-cham",
        "porabari",
        "tangail",
        "mishti",
        "dessert",
        "gouro-gosh",
        "1kg",
      ],
      featured: true,
      bestSeller: true,
      freshToday: true,
      seasonal: false,
      newArrival: true,
      freshlyMade: true,
      keepRefrigerated: true,
      sweetCategory: "cham-cham",
      collection: "sweets",
      brand: "ROOTORA",
      ingredients: ["chhana (milk solids)", "sugar syrup", "mawa / milk crumbs"],
      allergens: ["milk"],
      shelfLife: "Best within 3–4 days refrigerated",
      farmImages: [],
      storageInstruction:
        "Keep refrigerated. Serve chilled. Consume soon after opening for best texture.",
      farmName: "Gouro Gosh",
      farmStory:
        "Sourced from Gouro Gosh in Tangail — known locally for authentic Porabari-style Cham Cham.",
      farmerDistrict: "Tangail",
      seoTitle: "Porabari Cham Cham 1kg (Tangail) | ROOTORA",
      seoDescription: shortDescription,
      sku: "SWT-PORABARI-CC-1KG",
      deliveryTime: "Same / next day in Dhaka where available",
    },
    create: {
      name,
      slug: SLUG,
      shortDescription,
      description,
      productStory:
        "Porabari Cham Cham is Tangail’s pride. ROOTORA partners with Gouro Gosh — a trusted local shop — and brings you the same beloved taste, packed and served the ROOTORA way.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 350,
      originalPrice: 350,
      images,
      thumbnail: images[0],
      hoverImage: images[1] ?? images[0],
      ogImage: images[0],
      categoryId: category.id,
      productType: "physical",
      stockCount: 30,
      inStock: true,
      stockStatus: "in_stock",
      lowStockAlert: 5,
      organic: false,
      unit: "kg",
      weight: 1,
      origin: "Tangail, Bangladesh",
      country: "Bangladesh",
      originDistrict: "Tangail",
      originBadge: "Porabari · Tangail",
      tags: [
        "sweets",
        "cham-cham",
        "porabari",
        "tangail",
        "mishti",
        "dessert",
        "gouro-gosh",
        "1kg",
      ],
      featured: true,
      bestSeller: true,
      freshToday: true,
      seasonal: false,
      newArrival: true,
      freshlyMade: true,
      keepRefrigerated: true,
      sweetCategory: "cham-cham",
      collection: "sweets",
      brand: "ROOTORA",
      ingredients: ["chhana (milk solids)", "sugar syrup", "mawa / milk crumbs"],
      allergens: ["milk"],
      shelfLife: "Best within 3–4 days refrigerated",
      farmImages: [],
      storageInstruction:
        "Keep refrigerated. Serve chilled. Consume soon after opening for best texture.",
      farmName: "Gouro Gosh",
      farmStory:
        "Sourced from Gouro Gosh in Tangail — known locally for authentic Porabari-style Cham Cham.",
      farmerDistrict: "Tangail",
      seoTitle: "Porabari Cham Cham 1kg (Tangail) | ROOTORA",
      seoDescription: shortDescription,
      sku: "SWT-PORABARI-CC-1KG",
      deliveryTime: "Same / next day in Dhaka where available",
    },
  });

  console.log(`\n✓ ${product.name} — ৳${product.price}/${product.unit}`);
  console.log(`  Source: Gouro Gosh, Tangail`);
  console.log(`  URL: /shop/${product.slug}`);
  console.log(`  Images: ${images.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
