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
  const folder = "rootora/hero";
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

const CAMPAIGN_SLIDES = [
  {
    file: "hero-campaign-flash-sale.png",
    label: "Flash Sale",
    title: "Flash Sale",
    detail: "Up to 30% off honey & sweets",
    href: "/shop?filter=on-sale",
  },
  {
    file: "hero-campaign-punjabi-v2.png",
    label: "New Collection",
    title: "Traditional Punjabi",
    detail: "New season styles · Free delivery",
    href: "/shop?category=traditional-clothing",
  },
  {
    file: "hero-campaign-farm-fresh.png",
    label: "Farm Fresh",
    title: "Direct from Farmers",
    detail: "Organic honey & seasonal picks",
    href: "/shop?category=honey",
  },
] as const;

const SALE_PRODUCTS = [
  { slug: "porabari-cham-cham", price: 450, salePrice: 390 },
  { slug: "black-cotton-punjabi", price: 2200, salePrice: 1850 },
  { slug: "olive-cotton-tshirt", price: 1100, salePrice: 890 },
  { slug: "fresh-langra-mango", price: 500, salePrice: 420 },
] as const;

async function main() {
  const assetsDir = path.join(process.cwd(), "assets");

  await prisma.heroSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
    },
  });

  await prisma.heroSlide.deleteMany({ where: { heroId: "default" } });

  for (const [index, slide] of CAMPAIGN_SLIDES.entries()) {
    const filePath = path.join(assetsDir, slide.file);
    console.log(`Uploading ${slide.file}...`);
    const imageUrl = await uploadToCloudinary(filePath, slide.file);
    console.log(`  → ${imageUrl}`);

    await prisma.heroSlide.create({
      data: {
        heroId: "default",
        image: imageUrl,
        label: slide.label,
        title: slide.title,
        detail: slide.detail,
        href: slide.href,
        sortOrder: index,
        active: true,
      },
    });
  }

  console.log("\nSetting flash-sale prices...");
  for (const item of SALE_PRODUCTS) {
    const updated = await prisma.product.updateMany({
      where: { slug: item.slug },
      data: {
        price: item.price,
        originalPrice: item.price,
        salePrice: item.salePrice,
      },
    });
    if (updated.count > 0) {
      console.log(
        `  ✓ ${item.slug}: ৳${item.salePrice} (was ৳${item.price})`
      );
    } else {
      console.log(`  – ${item.slug} not found, skipped`);
    }
  }

  console.log("\n✓ Hero campaign slides seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
