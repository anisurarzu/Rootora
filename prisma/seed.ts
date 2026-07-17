import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
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
