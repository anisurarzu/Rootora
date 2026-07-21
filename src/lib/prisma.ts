import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Bump when Prisma schema shape changes so hot reload drops stale clients. */
const PRISMA_SCHEMA_VERSION = 15;

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function hasModel(
  client: PrismaClient,
  name: keyof PrismaClient & string
): boolean {
  const delegate = (client as unknown as Record<string, unknown>)[name];
  return Boolean(
    delegate &&
      typeof delegate === "object" &&
      typeof (delegate as { findMany?: unknown }).findMany === "function"
  );
}

/** Runtime field check — catches stale engines that still pass version bumps. */
function orderHasFields(client: PrismaClient, names: string[]): boolean {
  try {
    const fields = (
      client as unknown as {
        _runtimeDataModel?: {
          models?: { Order?: { fields?: Array<{ name?: string }> } };
        };
      }
    )._runtimeDataModel?.models?.Order?.fields;
    if (!fields?.length) return false;
    const present = new Set(fields.map((field) => field.name).filter(Boolean));
    return names.every((name) => present.has(name));
  } catch {
    return false;
  }
}

function isCurrentClient(client: PrismaClient) {
  return (
    hasModel(client, "role") &&
    hasModel(client, "permission") &&
    hasModel(client, "heroSettings") &&
    hasModel(client, "heroSlide") &&
    hasModel(client, "orderStatusEvent") &&
    hasModel(client, "supportConversation") &&
    hasModel(client, "supportMessage") &&
    orderHasFields(client, ["statusCode", "pathaoConsignmentId"]) &&
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

  // Always cache in dev so the next request can replace a stale Turbopack client.
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }

  return client;
}

/**
 * Lazy proxy — avoids crashing the whole app at import time when Turbopack
 * briefly serves a stale generated Prisma client after a schema change.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
