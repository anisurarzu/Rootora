import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Bump when Prisma schema shape changes so hot reload drops stale clients. */
const PRISMA_SCHEMA_VERSION = 6;

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function assertHeroModels(client: PrismaClient) {
  if (
    typeof client.heroSettings?.findUnique !== "function" ||
    typeof client.heroSlide?.findMany !== "function"
  ) {
    throw new Error(
      "Prisma client is missing HeroSettings/HeroSlide. Stop the Next.js server, run `npx prisma generate`, then start `npm run dev` again."
    );
  }
}

function isCurrentClient(client: PrismaClient) {
  return (
    typeof client.role?.count === "function" &&
    typeof client.permission?.count === "function" &&
    typeof client.heroSettings?.findUnique === "function" &&
    typeof client.heroSlide?.findMany === "function" &&
    globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION
  );
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma;

  if (existing && isCurrentClient(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  assertHeroModels(client);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }
  return client;
}

export const prisma = getPrismaClient();
