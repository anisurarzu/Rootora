"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { ensureFlashSaleDefaults } from "@/features/home/flash-sale";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);
}

const settingsSchema = z.object({
  enabled: z.boolean(),
  title: requiredText("Title", 60),
  subtitle: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : null)),
  shopAllLabel: requiredText("Shop all label", 40),
  shopAllHref: requiredText("Shop all link", 200),
  viewAllLabel: requiredText("View all label", 40),
  viewAllHref: requiredText("View all link", 200),
  productLimit: z.coerce.number().int().min(1).max(50),
  useAutoSale: z.boolean(),
  endsAt: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value, ctx) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid end date",
        });
        return z.NEVER;
      }
      return date;
    }),
});

function firstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input";
}

function revalidateFlashSale() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  revalidatePath("/shop");
  revalidatePath("/shop/flash-sale");
  revalidatePath("/admin/products");
}

function computeSalePrice(listPrice: number, discountPercent: number) {
  const sale = Math.round(listPrice * (100 - discountPercent)) / 100;
  return Math.max(0, Math.min(sale, listPrice - 0.01));
}

async function applyProductDiscount(productId: string, discountPercent: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, price: true },
  });

  if (!product) {
    return { success: false as const, error: "Product not found" };
  }

  const listPrice = Number(product.price);

  if (discountPercent <= 0) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        salePrice: null,
        discountType: null,
        discountAmount: null,
      },
    });
    return {
      success: true as const,
      name: product.name,
      salePrice: null as number | null,
    };
  }

  if (listPrice <= 0) {
    return {
      success: false as const,
      error: "Product price must be greater than 0 to apply a discount",
    };
  }

  const salePrice = computeSalePrice(listPrice, discountPercent);

  await prisma.product.update({
    where: { id: product.id },
    data: {
      salePrice,
      originalPrice: listPrice,
      discountType: "percentage",
      discountAmount: discountPercent,
    },
  });

  return {
    success: true as const,
    name: product.name,
    salePrice,
  };
}

export async function updateFlashSaleSettings(
  input: unknown
): Promise<ActionResult> {
  await requirePermission("content.manage");
  await ensureFlashSaleDefaults();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  try {
    await prisma.flashSaleSettings.update({
      where: { id: "default" },
      data: parsed.data,
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Could not save flash sale",
    };
  }

  revalidateFlashSale();
  return { success: true, message: "Flash Sale settings saved" };
}

const setProductsSchema = z.object({
  productIds: z.array(z.string().min(1)).max(100, "Too many products selected"),
  discountPercent: z.coerce
    .number()
    .min(1, "Discount must be at least 1%")
    .max(90, "Discount cannot exceed 90%"),
});

/**
 * Replace Flash Sale curated products and apply discount % to each.
 * Hero sidebar previews 3; all products appear on /shop/flash-sale.
 */
export async function setFlashSaleProducts(
  input: unknown
): Promise<ActionResult> {
  await requirePermission("content.manage");
  await ensureFlashSaleDefaults();

  const parsed = setProductsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  const productIds = [...new Set(parsed.data.productIds)];
  const { discountPercent } = parsed.data;

  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "PUBLISHED" },
      select: { id: true },
    });
    if (products.length !== productIds.length) {
      return {
        success: false,
        error: "One or more selected products are unavailable",
      };
    }
  }

  for (const productId of productIds) {
    const discountResult = await applyProductDiscount(
      productId,
      discountPercent
    );
    if (!discountResult.success) {
      return { success: false, error: discountResult.error };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.flashSaleItem.deleteMany({ where: { flashSaleId: "default" } });

    if (productIds.length > 0) {
      await tx.flashSaleItem.createMany({
        data: productIds.map((productId, index) => ({
          flashSaleId: "default",
          productId,
          sortOrder: index,
          active: true,
        })),
      });
    }

    await tx.flashSaleSettings.update({
      where: { id: "default" },
      data: {
        productLimit: 3,
        useAutoSale: false,
        shopAllLabel: "View details",
        shopAllHref: "/shop/flash-sale",
        viewAllLabel: "View details",
        viewAllHref: "/shop/flash-sale",
      },
    });
  });

  revalidateFlashSale();
  return {
    success: true,
    message:
      productIds.length === 0
        ? "Flash Sale products cleared"
        : `Saved ${productIds.length} Flash Sale product${productIds.length > 1 ? "s" : ""} with ${discountPercent}% off`,
  };
}

const addProductSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  discountPercent: z.coerce
    .number()
    .min(1, "Discount must be at least 1%")
    .max(90, "Discount cannot exceed 90%"),
});

export async function addFlashSaleProduct(
  input: unknown
): Promise<ActionResult> {
  await requirePermission("content.manage");
  await ensureFlashSaleDefaults();

  const parsed = addProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  const { productId, discountPercent } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
    select: { id: true, name: true },
  });

  if (!product) {
    return { success: false, error: "Published product not found" };
  }

  const count = await prisma.flashSaleItem.count({
    where: { flashSaleId: "default" },
  });

  const existing = await prisma.flashSaleItem.findUnique({
    where: {
      flashSaleId_productId: {
        flashSaleId: "default",
        productId: product.id,
      },
    },
  });

  if (existing) {
    return { success: false, error: "Product is already in Flash Sale" };
  }

  const discountResult = await applyProductDiscount(
    product.id,
    discountPercent
  );
  if (!discountResult.success) {
    return { success: false, error: discountResult.error };
  }

  await prisma.flashSaleItem.create({
    data: {
      flashSaleId: "default",
      productId: product.id,
      sortOrder: count,
      active: true,
    },
  });

  revalidateFlashSale();
  return {
    success: true,
    message: `${product.name} added with ${discountPercent}% off`,
  };
}

const discountUpdateSchema = z.object({
  itemId: z.string().min(1),
  discountPercent: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(90, "Discount cannot exceed 90%"),
});

export async function updateFlashSaleItemDiscount(
  input: unknown
): Promise<ActionResult> {
  await requirePermission("content.manage");

  const parsed = discountUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  const item = await prisma.flashSaleItem.findFirst({
    where: { id: parsed.data.itemId, flashSaleId: "default" },
    select: { id: true, productId: true },
  });

  if (!item) {
    return { success: false, error: "Flash Sale item not found" };
  }

  const discountResult = await applyProductDiscount(
    item.productId,
    parsed.data.discountPercent
  );
  if (!discountResult.success) {
    return { success: false, error: discountResult.error };
  }

  revalidateFlashSale();
  return {
    success: true,
    message:
      parsed.data.discountPercent > 0
        ? `Discount updated to ${parsed.data.discountPercent}%`
        : "Discount cleared on product",
  };
}

export async function removeFlashSaleProduct(
  itemId: string
): Promise<ActionResult> {
  await requirePermission("content.manage");

  const id = z.string().min(1).safeParse(itemId);
  if (!id.success) {
    return { success: false, error: "Invalid item" };
  }

  await prisma.flashSaleItem.deleteMany({
    where: { id: id.data, flashSaleId: "default" },
  });

  revalidateFlashSale();
  return { success: true, message: "Product removed from Flash Sale" };
}

export async function toggleFlashSaleItem(
  itemId: string,
  active: boolean
): Promise<ActionResult> {
  await requirePermission("content.manage");

  await prisma.flashSaleItem.updateMany({
    where: { id: itemId, flashSaleId: "default" },
    data: { active },
  });

  revalidateFlashSale();
  return {
    success: true,
    message: active ? "Product shown" : "Product hidden",
  };
}

export async function reorderFlashSaleItems(
  orderedIds: string[]
): Promise<ActionResult> {
  await requirePermission("content.manage");

  const ids = z.array(z.string().min(1)).min(1).safeParse(orderedIds);
  if (!ids.success) {
    return { success: false, error: "Invalid order" };
  }

  await prisma.$transaction(
    ids.data.map((id, index) =>
      prisma.flashSaleItem.updateMany({
        where: { id, flashSaleId: "default" },
        data: { sortOrder: index },
      })
    )
  );

  revalidateFlashSale();
  return { success: true, message: "Flash Sale order updated" };
}
