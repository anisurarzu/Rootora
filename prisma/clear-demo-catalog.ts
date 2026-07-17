import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Removes all catalog demo data (products, categories, farmers).
 * Keeps users, orders metadata, roles, and hero settings intact.
 * Run: npx tsx prisma/clear-demo-catalog.ts
 */
async function main() {
  console.log("Clearing demo catalog data...");

  const deletedOrderItems = await prisma.orderItem.deleteMany();
  console.log(`Deleted ${deletedOrderItems.count} order items`);

  const deletedReviews = await prisma.review.deleteMany();
  console.log(`Deleted ${deletedReviews.count} reviews`);

  const deletedWishlist = await prisma.wishlistItem.deleteMany();
  console.log(`Deleted ${deletedWishlist.count} wishlist items`);

  const deletedCart = await prisma.cartItem.deleteMany();
  console.log(`Deleted ${deletedCart.count} cart items`);

  const deletedVariants = await prisma.productVariant.deleteMany();
  console.log(`Deleted ${deletedVariants.count} product variants`);

  const deletedProducts = await prisma.product.deleteMany();
  console.log(`Deleted ${deletedProducts.count} products`);

  const deletedCategories = await prisma.category.deleteMany();
  console.log(`Deleted ${deletedCategories.count} categories`);

  const deletedFarmers = await prisma.farmer.deleteMany();
  console.log(`Deleted ${deletedFarmers.count} farmers`);

  console.log("Catalog cleared. Add categories and products from the admin panel.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
