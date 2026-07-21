import { randomBytes } from "crypto";
import { PaymentMethod } from "@prisma/client";
import {
  placeOrderInputSchema,
  type PlaceOrderInput,
} from "@/features/checkout/schema";
import { resolveCoupon } from "@/features/checkout/coupon";
import {
  calculateOrderTotals,
  generateOrderNumber,
  getOrderNumberPrefix,
} from "@/lib/checkout";
import { prisma } from "@/lib/prisma";

export {
  checkoutAddressSchema,
  checkoutItemSchema,
  placeOrderInputSchema,
  type PlaceOrderInput,
} from "@/features/checkout/schema";

export type PlaceOrderServiceResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      accessToken: string;
      total: number;
      paymentMethod: "COD";
    }
  | { success: false; error: string };

function createAccessToken() {
  return randomBytes(24).toString("hex");
}

/**
 * Place a COD order for a logged-in user or guest (`userId` null).
 * Guests must provide `newAddress` (saved addresses require login).
 */
export async function placeCodOrder(
  userId: string | null,
  rawInput: unknown
): Promise<PlaceOrderServiceResult> {
  const parsed = placeOrderInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid checkout details",
    };
  }

  const input = parsed.data;

  if (!userId) {
    if (!input.newAddress) {
      return {
        success: false,
        error: "Please enter a delivery address to checkout as a guest.",
      };
    }
    if (input.addressId) {
      return {
        success: false,
        error: "Saved addresses require login. Please enter a delivery address.",
      };
    }
  }

  let items = input.items ?? [];

  if (userId && (input.useCart || items.length === 0)) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      select: {
        productId: true,
        quantity: true,
        variantId: true,
      },
    });

    if (cartItems.length === 0 && items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    if (input.useCart || items.length === 0) {
      items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId,
      }));
    }
  }

  if (items.length === 0) {
    return { success: false, error: "Your cart is empty" };
  }

  try {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        stockCount: true,
        inStock: true,
        codAvailable: true,
        minOrderQty: true,
        maxOrderQty: true,
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      variantId?: string | null;
    }> = [];

    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return {
          success: false,
          error: "One or more products are unavailable. Please refresh your cart.",
        };
      }

      if (!product.codAvailable) {
        return {
          success: false,
          error: `${product.name} is not available for Cash on Delivery.`,
        };
      }

      if (!product.inStock || product.stockCount < item.quantity) {
        return {
          success: false,
          error: `${product.name} does not have enough stock.`,
        };
      }

      if (item.quantity < product.minOrderQty) {
        return {
          success: false,
          error: `${product.name} requires a minimum quantity of ${product.minOrderQty}.`,
        };
      }

      if (product.maxOrderQty && item.quantity > product.maxOrderQty) {
        return {
          success: false,
          error: `${product.name} allows a maximum quantity of ${product.maxOrderQty}.`,
        };
      }

      const unitPrice = Number(product.salePrice ?? product.price);
      subtotal += unitPrice * item.quantity;
      lineItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: unitPrice,
        variantId: item.variantId,
      });
    }

    const couponResult = await resolveCoupon(input.couponCode, subtotal);
    if (!couponResult.success) {
      return { success: false, error: couponResult.error };
    }

    const appliedCoupon = couponResult.coupon;
    const totals = calculateOrderTotals(subtotal, appliedCoupon?.discount ?? 0);
    const accessToken = createAccessToken();
    const guestEmail = input.guestEmail?.trim() || null;

    const order = await prisma.$transaction(async (tx) => {
      let finalAddressId = input.addressId;

      if (input.newAddress) {
        const attachToUser = Boolean(userId && input.saveAddress);
        const shouldBeDefault =
          attachToUser &&
          (await tx.address.count({ where: { userId: userId! } })) === 0;

        const created = await tx.address.create({
          data: {
            ...(attachToUser && userId ? { userId } : {}),
            label: input.newAddress.label || "Home",
            name: input.newAddress.name,
            phone: input.newAddress.phone,
            addressLine1: input.newAddress.addressLine1,
            addressLine2: input.newAddress.addressLine2 || null,
            district: input.newAddress.district,
            postalCode: input.newAddress.postalCode?.trim() || "",
            isDefault: shouldBeDefault,
          },
          select: { id: true },
        });
        finalAddressId = created.id;
      }

      if (!finalAddressId) {
        throw new Error("Delivery address is required.");
      }

      if (userId && input.addressId && !input.newAddress) {
        const ownedAddress = await tx.address.findFirst({
          where: { id: finalAddressId, userId },
          select: { id: true },
        });

        if (!ownedAddress) {
          throw new Error("Selected address was not found.");
        }
      }

      for (const line of lineItems) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
          select: {
            stockCount: true,
            lowStockAlert: true,
            inStock: true,
          },
        });

        if (!product || !product.inStock || product.stockCount < line.quantity) {
          throw new Error(
            "Stock changed while placing your order. Please try again."
          );
        }

        if (line.variantId) {
          const variant = await tx.productVariant.findFirst({
            where: { id: line.variantId, productId: line.productId },
            select: { id: true, stockCount: true },
          });

          if (!variant || variant.stockCount < line.quantity) {
            throw new Error(
              "Selected size is no longer available. Please update your cart."
            );
          }

          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stockCount: variant.stockCount - line.quantity },
          });
        }

        const nextStock = product.stockCount - line.quantity;
        await tx.product.update({
          where: { id: line.productId },
          data: {
            stockCount: nextStock,
            inStock: nextStock > 0,
            stockStatus:
              nextStock <= 0
                ? "out_of_stock"
                : nextStock <= product.lowStockAlert
                  ? "low_stock"
                  : "in_stock",
          },
        });
      }

      const prefix = getOrderNumberPrefix();
      const todaysOrders = await tx.order.count({
        where: { orderNumber: { startsWith: prefix } },
      });

      let sequence = todaysOrders + 1;
      let orderNumber = generateOrderNumber(sequence);

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const exists = await tx.order.findUnique({
          where: { orderNumber },
          select: { id: true },
        });
        if (!exists) break;
        sequence += 1;
        orderNumber = generateOrderNumber(sequence);
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          accessToken,
          guestEmail,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: PaymentMethod.COD,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          discount: totals.discount,
          total: totals.total,
          addressId: finalAddressId,
          couponId: appliedCoupon?.id ?? null,
          notes: input.notes?.trim() || null,
          items: {
            create: lineItems.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              price: line.price,
              variantId: line.variantId || null,
            })),
          },
          statusEvents: {
            create: {
              status: "PENDING",
            },
          },
        },
        select: {
          id: true,
          orderNumber: true,
          accessToken: true,
          total: true,
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (userId) {
        await tx.cartItem.deleteMany({ where: { userId } });
      }

      return createdOrder;
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
      total: Number(order.total),
      paymentMethod: "COD",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not place your order. Please try again.",
    };
  }
}

/** @deprecated Prefer placeCodOrder — kept for API callers */
export async function placeCodOrderForUser(
  userId: string,
  rawInput: unknown
): Promise<PlaceOrderServiceResult> {
  return placeCodOrder(userId, rawInput);
}
