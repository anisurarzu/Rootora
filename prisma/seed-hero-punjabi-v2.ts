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

async function main() {
  const filePath = path.join(
    process.cwd(),
    "assets",
    "hero-campaign-punjabi-v2.png"
  );

  console.log("Uploading hero-campaign-punjabi-v2.png...");
  const imageUrl = await uploadToCloudinary(
    filePath,
    "hero-campaign-punjabi-v2.png"
  );
  console.log(`  → ${imageUrl}`);

  const slide = await prisma.heroSlide.findFirst({
    where: {
      heroId: "default",
      title: "Traditional Punjabi",
    },
  });

  if (!slide) {
    throw new Error("Traditional Punjabi hero slide not found in database.");
  }

  await prisma.heroSlide.update({
    where: { id: slide.id },
    data: { image: imageUrl },
  });

  console.log("\n✓ Punjabi campaign banner updated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
