import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import {
  blogPosts,
  categories,
  farmers,
  products,
  recipes,
} from "../src/lib/mock-data";
import { ensureHeroDefaults } from "../src/features/home/hero";
import { PERMISSIONS, SYSTEM_ROLES } from "../src/lib/permissions";

const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  console.log("Seeding roles and permissions...");

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        module: permission.module,
        description: permission.description,
      },
      create: {
        key: permission.key,
        name: permission.name,
        module: permission.module,
        description: permission.description,
      },
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const permissionByKey = new Map(
    allPermissions.map((permission) => [permission.key, permission.id])
  );

  for (const role of Object.values(SYSTEM_ROLES)) {
    const savedRole = await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
      },
      create: {
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: true,
      },
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: savedRole.id },
    });

    const permissionIds = role.permissions
      .map((key) => permissionByKey.get(key))
      .filter((id): id is string => Boolean(id));

    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: savedRole.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }
}

async function main() {
  console.log("Seeding ROOTORA database...");

  await seedRolesAndPermissions();
  await ensureHeroDefaults();
  console.log("Homepage hero defaults ready.");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        image: category.image,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
    });
  }

  for (const farmer of farmers) {
    await prisma.farmer.upsert({
      where: { slug: farmer.slug },
      update: {
        name: farmer.name,
        village: farmer.village,
        district: farmer.district,
        story: farmer.story,
        image: farmer.image,
        gallery: farmer.gallery,
        verified: farmer.verified,
      },
      create: {
        id: farmer.id,
        name: farmer.name,
        slug: farmer.slug,
        village: farmer.village,
        district: farmer.district,
        story: farmer.story,
        image: farmer.image,
        gallery: farmer.gallery,
        verified: farmer.verified,
      },
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.category.slug },
    });
    if (!category) continue;

    const farmer = product.farmer
      ? await prisma.farmer.findUnique({ where: { slug: product.farmer.slug } })
      : null;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        status: "PUBLISHED",
        thumbnail: product.images[0],
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        categoryId: category.id,
        farmerId: farmer?.id,
        stockCount: product.stockCount,
        inStock: product.inStock,
        organic: product.organic,
        unit: product.unit,
        origin: product.origin,
        tags: product.tags,
        featured: Boolean(product.featured),
        bestSeller: Boolean(product.bestSeller),
        freshToday: Boolean(product.freshToday),
        seasonal: Boolean(product.seasonal),
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        status: "PUBLISHED",
        publishedAt: new Date(),
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        thumbnail: product.images[0],
        categoryId: category.id,
        farmerId: farmer?.id,
        stockCount: product.stockCount,
        inStock: product.inStock,
        organic: product.organic,
        unit: product.unit,
        origin: product.origin,
        tags: product.tags,
        featured: Boolean(product.featured),
        bestSeller: Boolean(product.bestSeller),
        freshToday: Boolean(product.freshToday),
        seasonal: Boolean(product.seasonal),
        ingredients: [],
        allergens: [],
        farmImages: [],
      },
    });
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: `${post.excerpt}\n\nFull article coming soon from the ROOTORA editorial team.`,
        image: post.image,
        author: post.author,
        category: post.category,
        published: true,
        publishedAt: new Date(post.publishedAt),
        readTime: post.readTime,
      },
      create: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: `${post.excerpt}\n\nFull article coming soon from the ROOTORA editorial team.`,
        image: post.image,
        author: post.author,
        category: post.category,
        published: true,
        publishedAt: new Date(post.publishedAt),
        readTime: post.readTime,
      },
    });
  }

  for (const recipe of recipes) {
    await prisma.recipe.upsert({
      where: { slug: recipe.slug },
      update: {
        title: recipe.title,
        description: recipe.description,
        content: recipe.description,
        image: recipe.image,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        ingredients: [
          "See ROOTORA kitchen notes for full ingredients.",
        ],
        published: true,
      },
      create: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        content: recipe.description,
        image: recipe.image,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        ingredients: [
          "See ROOTORA kitchen notes for full ingredients.",
        ],
        published: true,
      },
    });
  }

  const adminEmail = "admin@rootora.com";
  const adminPassword = "Admin123!";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    const admin = await prisma.user.create({
      data: {
        name: "ROOTORA Admin",
        email: adminEmail,
        emailVerified: true,
        role: "ADMIN",
        phone: "+8801700000000",
      },
    });

    await prisma.account.create({
      data: {
        userId: admin.id,
        accountId: admin.id,
        providerId: "credential",
        password: passwordHash,
      },
    });

    console.log(`Admin user ready: ${adminEmail}`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN" },
    });
    console.log(`Admin already exists: ${adminEmail}`);
  }

  const demoEmail = "customer@rootora.com";
  const demoPassword = "Customer123!";
  const existingCustomer = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!existingCustomer) {
    const passwordHash = await hashPassword(demoPassword);
    const customer = await prisma.user.create({
      data: {
        name: "Demo Customer",
        email: demoEmail,
        emailVerified: true,
        role: "CUSTOMER",
        phone: "+8801711111111",
      },
    });

    await prisma.account.create({
      data: {
        userId: customer.id,
        accountId: customer.id,
        providerId: "credential",
        password: passwordHash,
      },
    });

    await prisma.address.create({
      data: {
        userId: customer.id,
        label: "Home",
        name: "Demo Customer",
        phone: "+8801711111111",
        addressLine1: "House 12, Road 5, Dhanmondi",
        district: "Dhaka",
        postalCode: "1205",
        isDefault: true,
      },
    });

    console.log(`Customer user ready: ${demoEmail}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
