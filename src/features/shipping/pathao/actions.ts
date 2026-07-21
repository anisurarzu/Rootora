"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-server";
import {
  createPathaoOrder,
  getDefaultPathaoStoreId,
  getPathaoOrderInfo,
  isPathaoConfigured,
  listPathaoAreas,
  listPathaoCities,
  listPathaoStores,
  listPathaoZones,
} from "@/features/shipping/pathao/client";

const shipSchema = z.object({
  orderId: z.string().min(1),
  storeId: z.coerce.number().int().positive(),
  cityId: z.coerce.number().int().positive(),
  zoneId: z.coerce.number().int().positive(),
  areaId: z.coerce.number().int().positive(),
  itemWeight: z.coerce.number().positive().max(20).default(0.5),
  specialInstruction: z.string().max(500).optional(),
});

function normalizeBdPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) {
    return `0${digits.slice(3)}`;
  }
  if (digits.length === 11 && digits.startsWith("01")) return digits;
  if (digits.length === 10 && digits.startsWith("1")) return `0${digits}`;
  return digits;
}

export async function getPathaoShippingOptions() {
  await requirePermission(["orders.manage"]);
  if (!isPathaoConfigured()) {
    return {
      configured: false as const,
      stores: [],
      defaultStoreId: null,
      error: "Pathao env vars are missing.",
    };
  }

  try {
    const stores = await listPathaoStores();
    return {
      configured: true as const,
      stores,
      defaultStoreId: getDefaultPathaoStoreId() ?? stores[0]?.store_id ?? null,
      error: null,
    };
  } catch (error) {
    return {
      configured: true as const,
      stores: [],
      defaultStoreId: getDefaultPathaoStoreId(),
      error: error instanceof Error ? error.message : "Failed to load Pathao stores",
    };
  }
}

export async function getPathaoCitiesAction() {
  await requirePermission(["orders.manage"]);
  return listPathaoCities();
}

export async function getPathaoZonesAction(cityId: number) {
  await requirePermission(["orders.manage"]);
  return listPathaoZones(cityId);
}

export async function getPathaoAreasAction(zoneId: number) {
  await requirePermission(["orders.manage"]);
  return listPathaoAreas(zoneId);
}

export async function createPathaoShipmentAction(input: z.infer<typeof shipSchema>) {
  await requirePermission(["orders.manage"]);

  if (!isPathaoConfigured()) {
    return { success: false as const, error: "Pathao is not configured." };
  }

  const parsed = shipSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid Pathao shipment data." };
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: {
      address: true,
      items: { include: { product: { select: { name: true } } } },
    },
  });

  if (!order) {
    return { success: false as const, error: "Order not found." };
  }

  if (order.pathaoConsignmentId) {
    return {
      success: false as const,
      error: `Already shipped via Pathao (${order.pathaoConsignmentId}).`,
    };
  }

  const phone = normalizeBdPhone(order.address.phone);
  if (!/^01\d{9}$/.test(phone)) {
    return {
      success: false as const,
      error: "Recipient phone must be a valid BD mobile (01XXXXXXXXX).",
    };
  }

  const addressLine = [
    order.address.addressLine1,
    order.address.addressLine2,
    order.address.district,
    order.address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const itemQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemDescription = order.items
    .map((item) => `${item.product?.name ?? "Product"} x${item.quantity}`)
    .join(", ")
    .slice(0, 240);

  const amountToCollect =
    order.paymentStatus === "PAID" ? 0 : Math.round(Number(order.total));

  try {
    const created = await createPathaoOrder({
      store_id: parsed.data.storeId,
      merchant_order_id: order.orderNumber,
      recipient_name: order.address.name.slice(0, 100),
      recipient_phone: phone,
      recipient_address: addressLine.slice(0, 220),
      recipient_city: parsed.data.cityId,
      recipient_zone: parsed.data.zoneId,
      recipient_area: parsed.data.areaId,
      delivery_type: 48,
      item_type: 2,
      special_instruction:
        parsed.data.specialInstruction?.trim() ||
        order.notes?.trim() ||
        undefined,
      item_quantity: Math.max(1, itemQuantity),
      item_weight: parsed.data.itemWeight,
      amount_to_collect: amountToCollect,
      item_description: itemDescription || `ROOTORA order ${order.orderNumber}`,
    });

    const consignmentId = String(created.consignment_id);
    const deliveryFee =
      created.delivery_fee != null ? Number(created.delivery_fee) : null;

    const nextStatus =
      order.status === "PENDING" || order.status === "CONFIRMED"
        ? "PROCESSING"
        : order.status === "PROCESSING"
          ? "SHIPPED"
          : order.status;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          pathaoConsignmentId: consignmentId,
          pathaoDeliveryFee: deliveryFee,
          pathaoStatus: created.order_status ?? "Pending",
          pathaoStoreId: parsed.data.storeId,
          pathaoCityId: parsed.data.cityId,
          pathaoZoneId: parsed.data.zoneId,
          pathaoAreaId: parsed.data.areaId,
          pathaoSyncedAt: new Date(),
          status: nextStatus,
        },
      }),
      prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: nextStatus,
          note: `Pathao consignment created: ${consignmentId}`,
        },
      }),
    ]);

    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath("/admin/orders");

    return {
      success: true as const,
      consignmentId,
      deliveryFee,
      status: created.order_status ?? "Pending",
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Pathao shipment failed",
    };
  }
}

export async function refreshPathaoShipmentAction(orderId: string) {
  await requirePermission(["orders.manage"]);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.pathaoConsignmentId) {
    return { success: false as const, error: "No Pathao consignment on this order." };
  }

  try {
    const info = await getPathaoOrderInfo(order.pathaoConsignmentId);
    const data = (info.data ?? {}) as Record<string, unknown>;
    const status =
      (typeof data.order_status === "string" && data.order_status) ||
      (typeof data.status === "string" && data.status) ||
      order.pathaoStatus;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        pathaoStatus: status,
        pathaoSyncedAt: new Date(),
      },
    });

    revalidatePath(`/admin/orders/${order.id}`);
    return { success: true as const, status };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to refresh Pathao status",
    };
  }
}
