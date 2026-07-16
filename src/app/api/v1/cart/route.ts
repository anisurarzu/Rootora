import { z } from "zod";
import { requireApiSession, parseJsonBody } from "@/lib/api/auth";
import {
  ApiHttpError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { calculateOrderTotals } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  variantId: z.string().optional().nullable(),
});

const patchSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
  variantId: z.string().optional().nullable(),
});

async function getCartPayload(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          images: true,
          thumbnail: true,
          unit: true,
          inStock: true,
          stockCount: true,
          codAvailable: true,
          status: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const mapped = items
    .filter((item) => item.product.status === "PUBLISHED")
    .map((item) => {
      const unitPrice = Number(item.product.salePrice ?? item.product.price);
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          salePrice:
            item.product.salePrice != null
              ? Number(item.product.salePrice)
              : null,
          image: item.product.thumbnail || item.product.images[0] || null,
          unit: item.product.unit,
          inStock: item.product.inStock,
          stockCount: item.product.stockCount,
          codAvailable: item.product.codAvailable,
        },
      };
    });

  const subtotal = mapped.reduce((sum, item) => sum + item.lineTotal, 0);
  const totals = calculateOrderTotals(subtotal);

  return {
    items: mapped,
    itemCount: mapped.reduce((sum, item) => sum + item.quantity, 0),
    ...totals,
  };
}

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    return apiOk(await getCartPayload(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const body = await parseJsonBody(request);
    const parsed = upsertSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiHttpError(
        parsed.error.issues[0]?.message ?? "Invalid cart payload",
        400,
        { code: "VALIDATION_ERROR" }
      );
    }

    const { productId, quantity, variantId } = parsed.data;
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "PUBLISHED" },
      select: { id: true, stockCount: true, inStock: true },
    });

    if (!product || !product.inStock) {
      throw new ApiHttpError("Product is unavailable", 400, {
        code: "PRODUCT_UNAVAILABLE",
      });
    }

    if (product.stockCount < quantity) {
      throw new ApiHttpError("Not enough stock", 400, { code: "OUT_OF_STOCK" });
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          variantId: variantId || null,
        },
      });
    }

    return apiOk(await getCartPayload(user.id), {
      message: "Added to cart",
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const body = await parseJsonBody(request);
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiHttpError(
        parsed.error.issues[0]?.message ?? "Invalid cart payload",
        400,
        { code: "VALIDATION_ERROR" }
      );
    }

    const { productId, quantity, variantId } = parsed.data;
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (!existing) {
      throw new ApiHttpError("Cart item not found", 404, { code: "NOT_FOUND" });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity },
      });
    }

    return apiOk(await getCartPayload(user.id), { message: "Cart updated" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const { searchParams } = new URL(request.url);
    const clear = searchParams.get("clear") === "true";
    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId");

    if (clear) {
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
      return apiOk(await getCartPayload(user.id), { message: "Cart cleared" });
    }

    if (!productId) {
      throw new ApiHttpError("Provide productId or clear=true", 400, {
        code: "VALIDATION_ERROR",
      });
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        productId,
        variantId: variantId || null,
      },
    });

    return apiOk(await getCartPayload(user.id), { message: "Item removed" });
  } catch (error) {
    return handleApiError(error);
  }
}
