import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Bump when Prisma schema shape changes so hot reload drops stale clients. */
const PRISMA_SCHEMA_VERSION = 17;

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function hasModel(client: PrismaClient, name: string): boolean {
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

const REQUIRED_MODELS = [
  "role",
  "permission",
  "heroSettings",
  "heroSlide",
  "flashSaleSettings",
  "flashSaleItem",
  "orderStatusEvent",
  "supportConversation",
  "supportMessage",
] as const;

function isCurrentClient(client: PrismaClient) {
  return (
    REQUIRED_MODELS.every((name) => hasModel(client, name)) &&
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

  if (
    !REQUIRED_MODELS.every((name) => hasModel(client, name)) &&
    process.env.NODE_ENV !== "production"
  ) {
    console.error(
      "[prisma] Generated client is missing required models (e.g. flashSaleSettings). Restart the dev server after `npx prisma generate`."
    );
  }

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
    let value = Reflect.get(client, prop, client);

    // Stale Node module cache: force one rebuild if a known model is missing.
    if (
      value === undefined &&
      typeof prop === "string" &&
      (REQUIRED_MODELS as readonly string[]).includes(prop)
    ) {
      globalForPrisma.prisma = undefined;
      globalForPrisma.prismaSchemaVersion = undefined;
      const refreshed = getPrismaClient();
      value = Reflect.get(refreshed, prop, refreshed);
      if (value === undefined) {
        throw new Error(
          `Prisma model "${prop}" is missing. Run \`npx prisma generate\` and restart the dev server.`
        );
      }
      return typeof value === "function" ? value.bind(refreshed) : value;
    }

    return typeof value === "function" ? value.bind(client) : value;
  },
});
