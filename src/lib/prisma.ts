import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

/** Bump when Prisma schema shape changes so hot reload drops stale clients. */
const PRISMA_SCHEMA_VERSION = 20;

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

function getModelFields(
  client: PrismaClient,
  model: string
): Array<{ name?: string; isRequired?: boolean }> | undefined {
  try {
    return (
      client as unknown as {
        _runtimeDataModel?: {
          models?: Record<
            string,
            { fields?: Array<{ name?: string; isRequired?: boolean }> }
          >;
        };
      }
    )._runtimeDataModel?.models?.[model]?.fields;
  } catch {
    return undefined;
  }
}

function orderHasFields(client: PrismaClient, names: string[]): boolean {
  const fields = getModelFields(client, "Order");
  if (!fields?.length) return false;
  const present = new Set(fields.map((field) => field.name).filter(Boolean));
  return names.every((name) => present.has(name));
}

function orderItemProductIdIsOptional(client: PrismaClient): boolean {
  const fields = getModelFields(client, "OrderItem");
  const productId = fields?.find((field) => field.name === "productId");
  return Boolean(productId && productId.isRequired === false);
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

function clientMatchesSchema(client: PrismaClient) {
  return (
    REQUIRED_MODELS.every((name) => hasModel(client, name)) &&
    orderHasFields(client, ["statusCode", "pathaoConsignmentId"]) &&
    orderItemProductIdIsOptional(client)
  );
}

function isCurrentClient(client: PrismaClient) {
  return (
    clientMatchesSchema(client) &&
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
    globalForPrisma.prismaSchemaVersion = undefined;
  }

  const client = createPrismaClient();
  const shapeOk = clientMatchesSchema(client);

  if (!shapeOk && process.env.NODE_ENV !== "production") {
    console.error(
      "[prisma] Generated client is stale or incomplete (missing models or OrderItem.productId still required). Run `npx prisma generate`, delete `.next`, and restart the dev server."
    );
  }

  globalForPrisma.prisma = client;
  // Only pin the schema version when the client actually matches the schema.
  if (shapeOk) {
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
    if (typeof prop === "symbol") {
      const client = getPrismaClient();
      return Reflect.get(client, prop, client);
    }

    const client = getPrismaClient();
    let value = Reflect.get(client, prop, client);

    if (value === undefined && typeof prop === "string") {
      globalForPrisma.prisma = undefined;
      globalForPrisma.prismaSchemaVersion = undefined;
      const refreshed = getPrismaClient();
      value = Reflect.get(refreshed, prop, refreshed);

      if (
        value === undefined &&
        (REQUIRED_MODELS as readonly string[]).includes(prop)
      ) {
        throw new Error(
          `Prisma model "${prop}" is missing. Run \`npx prisma generate\`, delete the \`.next\` folder, and restart the dev server.`
        );
      }

      return typeof value === "function" ? value.bind(refreshed) : value;
    }

    return typeof value === "function" ? value.bind(client) : value;
  },
});
