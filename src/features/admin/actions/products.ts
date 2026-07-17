"use server";

import { Prisma, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/features/admin/types";
import {
  formValuesToPrismaData,
  productToFormValues,
} from "@/features/admin/products/mappers";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/admin/products/schema";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function revalidateProductPaths(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  if (slug) {
    revalidatePath(`/shop/${slug}`);
    revalidatePath(`/admin/products/${slug}`);
  }
}

async function uniqueSlug(base: string, excludeId?: string) {
  let candidate = slugify(base) || `product-${Date.now()}`;
  let attempt = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    attempt += 1;
    candidate = `${slugify(base)}-${attempt}`;
  }
}

function mapVariants(values: ProductFormValues) {
  return values.variants
    .filter((variant) => variant.name.trim() && variant.value.trim())
    .map((variant) => ({
      name: variant.name.trim(),
      value: variant.value.trim(),
      image: variant.image?.trim() || null,
      sku: variant.sku?.trim() || null,
      price: variant.price ?? null,
      salePrice: variant.salePrice ?? null,
      stockCount: variant.stockCount ?? 0,
    }));
}

function parseFormValues(
  input: unknown
): ActionResult<ProductFormValues> {
  const parsed = productFormSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_form";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}

export async function getAdminProduct(productId: string) {
  await requirePermission("products.view");

  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
      category: true,
      farmer: true,
    },
  });
}

export async function createProduct(
  rawValues: unknown,
  options?: { asDraft?: boolean }
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission(["products.create", "products.edit"]);

  const parsed = parseFormValues(rawValues);
  if (!parsed.success || !parsed.data) {
    return {
      success: false,
      error: parsed.success ? "Invalid product data." : parsed.error,
      fieldErrors: parsed.success ? undefined : parsed.fieldErrors,
    };
  }

  const values = {
    ...parsed.data,
    status: options?.asDraft ? ProductStatus.DRAFT : parsed.data.status,
  };

  try {
    const slug = await uniqueSlug(values.slug || values.name);
    const data = formValuesToPrismaData({ ...values, slug });

    const product = await prisma.product.create({
      data: {
        ...data,
        publishedAt:
          values.status === ProductStatus.PUBLISHED ? new Date() : null,
        variants: {
          create: mapVariants(values),
        },
      },
      select: { id: true, slug: true },
    });

    revalidateProductPaths(product.slug);

    return {
      success: true,
      data: product,
      message:
        values.status === ProductStatus.DRAFT
          ? "Draft saved successfully."
          : "Product created successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A product with this slug or SKU already exists.",
      };
    }
    console.error(error);
    return { success: false, error: "Failed to create product." };
  }
}

export async function updateProduct(
  productId: string,
  rawValues: unknown,
  options?: { asDraft?: boolean }
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission("products.edit");

  const parsed = parseFormValues(rawValues);
  if (!parsed.success || !parsed.data) {
    return {
      success: false,
      error: parsed.success ? "Invalid product data." : parsed.error,
      fieldErrors: parsed.success ? undefined : parsed.fieldErrors,
    };
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, publishedAt: true, status: true },
  });

  if (!existing) {
    return { success: false, error: "Product not found." };
  }

  const values = {
    ...parsed.data,
    status: options?.asDraft ? ProductStatus.DRAFT : parsed.data.status,
  };

  try {
    const slug = await uniqueSlug(values.slug || values.name, productId);
    const data = formValuesToPrismaData({ ...values, slug });

    let publishedAt = existing.publishedAt;
    if (
      values.status === ProductStatus.PUBLISHED &&
      !existing.publishedAt
    ) {
      publishedAt = new Date();
    }
    if (values.status !== ProductStatus.PUBLISHED) {
      publishedAt = existing.publishedAt;
    }

    const product = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId } });

      return tx.product.update({
        where: { id: productId },
        data: {
          ...data,
          publishedAt,
          variants: {
            create: mapVariants(values),
          },
        },
        select: { id: true, slug: true },
      });
    });

    revalidateProductPaths(product.slug);

    return {
      success: true,
      data: product,
      message: options?.asDraft
        ? "Draft autosaved."
        : "Product updated successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A product with this slug or SKU already exists.",
      };
    }
    console.error(error);
    return { success: false, error: "Failed to update product." };
  }
}

export async function deleteProduct(
  productId: string
): Promise<ActionResult> {
  await requirePermission("products.delete");

  try {
    const product = await prisma.product.delete({
      where: { id: productId },
      select: { slug: true },
    });
    revalidateProductPaths(product.slug);
    return { success: true, message: "Product deleted." };
  } catch {
    return { success: false, error: "Failed to delete product." };
  }
}

export async function duplicateProduct(
  productId: string
): Promise<ActionResult<{ id: string }>> {
  await requirePermission(["products.create", "products.edit"]);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    return { success: false, error: "Product not found." };
  }

  const formValues = productToFormValues(product);
  const slug = await uniqueSlug(`${product.slug}-copy`);

  const created = await prisma.product.create({
    data: {
      ...formValuesToPrismaData({
        ...formValues,
        name: `${product.name} (Copy)`,
        slug,
        status: ProductStatus.DRAFT,
        sku: product.sku ? `${product.sku}-COPY` : "",
      }),
      status: ProductStatus.DRAFT,
      publishedAt: null,
      variants: {
        create: product.variants.map((variant) => ({
          name: variant.name,
          value: variant.value,
          image: variant.image,
          price: variant.price,
          salePrice: variant.salePrice,
          stockCount: variant.stockCount,
          sku: variant.sku ? `${variant.sku}-COPY` : null,
        })),
      },
    },
    select: { id: true },
  });

  revalidateProductPaths(slug);

  return {
    success: true,
    data: created,
    message: "Product duplicated as draft.",
  };
}

export async function setProductStatus(
  productId: string,
  status: ProductStatus
): Promise<ActionResult> {
  await requirePermission("products.publish");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { publishedAt: true, slug: true },
  });

  if (!product) {
    return { success: false, error: "Product not found." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      status,
      publishedAt:
        status === ProductStatus.PUBLISHED
          ? product.publishedAt ?? new Date()
          : product.publishedAt,
    },
  });

  revalidateProductPaths(product.slug);

  const labels: Record<ProductStatus, string> = {
    DRAFT: "moved to draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
  };

  return { success: true, message: `Product ${labels[status]}.` };
}

export async function bulkUpdateProductStatus(
  productIds: string[],
  status: ProductStatus
): Promise<ActionResult<{ count: number }>> {
  await requirePermission("products.publish");

  if (productIds.length === 0) {
    return { success: false, error: "No products selected." };
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: {
      status,
      ...(status === ProductStatus.PUBLISHED
        ? { publishedAt: new Date() }
        : {}),
    },
  });

  revalidateProductPaths();

  return {
    success: true,
    data: { count: result.count },
    message: `Updated ${result.count} products.`,
  };
}

export async function bulkDeleteProducts(
  productIds: string[]
): Promise<ActionResult<{ count: number }>> {
  await requirePermission("products.delete");

  if (productIds.length === 0) {
    return { success: false, error: "No products selected." };
  }

  const result = await prisma.product.deleteMany({
    where: { id: { in: productIds } },
  });

  revalidateProductPaths();

  return {
    success: true,
    data: { count: result.count },
    message: `Deleted ${result.count} products.`,
  };
}

export async function toggleFeatured(productId: string) {
  await requirePermission("products.edit");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { featured: true, slug: true },
  });

  if (!product) {
    return { success: false, error: "Product not found." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { featured: !product.featured },
  });

  revalidateProductPaths(product.slug);
  return { success: true };
}

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  stockCount: number;
  status: ProductStatus;
  thumbnail: string | null;
  images: string[];
  brand: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
};

export async function getAdminProductsList(params?: {
  search?: string;
  status?: ProductStatus | "ALL";
  categoryId?: string;
}): Promise<AdminProductListItem[]> {
  await requirePermission("products.view");

  const products = await prisma.product.findMany({
    where: {
      ...(params?.status && params.status !== "ALL"
        ? { status: params.status }
        : {}),
      ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params?.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { sku: { contains: params.search, mode: "insensitive" } },
              { brand: { contains: params.search, mode: "insensitive" } },
              { slug: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    salePrice: product.salePrice != null ? Number(product.salePrice) : null,
    stockCount: product.stockCount,
    status: product.status,
    thumbnail: product.thumbnail,
    images: product.images,
    brand: product.brand,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category,
  }));
}
