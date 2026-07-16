import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Bump when Prisma schema shape changes so hot reload drops stale clients. */
const PRISMA_SCHEMA_VERSION = 3;

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function isCurrentClient(client: PrismaClient) {
  return (
    typeof client.role?.count === "function" &&
    typeof client.permission?.count === "function" &&
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
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }
  return client;
}

export const prisma = getPrismaClient();
