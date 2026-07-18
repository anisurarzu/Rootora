import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "traditional-clothing" },
    update: {
      name: "Traditional Clothing",
      description:
        "Handcrafted Punjabi and heritage Bangladeshi wear — comfort, craft, and everyday elegance.",
      image: "/images/categories/traditional-clothing.png",
    },
    create: {
      name: "Traditional Clothing",
      slug: "traditional-clothing",
      description:
        "Handcrafted Punjabi and heritage Bangladeshi wear — comfort, craft, and everyday elegance.",
      image: "/images/categories/traditional-clothing.png",
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "black-cotton-punjabi" },
    update: {
      name: "Black Cotton Punjabi",
      shortDescription:
        "Classic black Punjabi in breathable cotton — comfortable for daily wear and special occasions.",
      description:
        "A timeless black Punjabi tailored from soft, breathable cotton fabric. Lightweight and comfortable for Bangladesh's climate, with a clean traditional cut that works for prayers, family gatherings, and everyday elegance. Pair with pajama or formal trousers for a complete look.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 1850,
      originalPrice: 2200,
      images: ["/images/products/placeholder.png"],
      thumbnail: "/images/products/placeholder.png",
      categoryId: category.id,
      stockCount: 25,
      inStock: true,
      organic: false,
      unit: "piece",
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: ["punjabi", "traditional", "mens", "cotton", "black", "clothing"],
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
      name: "Black Cotton Punjabi",
      slug: "black-cotton-punjabi",
      shortDescription:
        "Classic black Punjabi in breathable cotton — comfortable for daily wear and special occasions.",
      description:
        "A timeless black Punjabi tailored from soft, breathable cotton fabric. Lightweight and comfortable for Bangladesh's climate, with a clean traditional cut that works for prayers, family gatherings, and everyday elegance. Pair with pajama or formal trousers for a complete look.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      price: 1850,
      originalPrice: 2200,
      images: ["/images/products/placeholder.png"],
      thumbnail: "/images/products/placeholder.png",
      categoryId: category.id,
      stockCount: 25,
      inStock: true,
      organic: false,
      unit: "piece",
      origin: "Bangladesh",
      country: "Bangladesh",
      tags: ["punjabi", "traditional", "mens", "cotton", "black", "clothing"],
      featured: true,
      collection: "clothing",
      brand: "ROOTORA",
      ingredients: [],
      allergens: [],
      farmImages: [],
    },
  });

  console.log("Category:", category.name, `(${category.slug})`);
  console.log("Product:", product.name, `(${product.slug})`);
  console.log("Live URL: /shop/black-cotton-punjabi");
  console.log(
    "Note: Replace placeholder image in Admin → Products → edit when your photo is ready."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
