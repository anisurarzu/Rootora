"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { ActionResult } from "@/features/admin/types";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const validStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const validPaymentStatuses: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

function revalidate(orderId?: string) {
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  if (orderId) {
    revalidatePath(`/admin/orders/${orderId}`);
  }
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
}): Promise<ActionResult> {
  await requirePermission("orders.manage");

  if (!input.orderId || !validStatuses.includes(input.status)) {
    return { success: false, error: "Invalid order status." };
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { id: true },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  await prisma.order.update({
    where: { id: input.orderId },
    data: { status: input.status },
  });

  revalidate(input.orderId);
  return { success: true, message: "Order status updated." };
}

export async function updatePaymentStatus(input: {
  orderId: string;
  paymentStatus: PaymentStatus;
}): Promise<ActionResult> {
  await requirePermission("orders.manage");

  if (!input.orderId || !validPaymentStatuses.includes(input.paymentStatus)) {
    return { success: false, error: "Invalid payment status." };
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { id: true },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  await prisma.order.update({
    where: { id: input.orderId },
    data: { paymentStatus: input.paymentStatus },
  });

  revalidate(input.orderId);
  return { success: true, message: "Payment status updated." };
}

export async function updateOrderNotes(input: {
  orderId: string;
  notes: string;
}): Promise<ActionResult> {
  await requirePermission("orders.manage");

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { id: true },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  await prisma.order.update({
    where: { id: input.orderId },
    data: { notes: input.notes.trim() || null },
  });

  revalidate(input.orderId);
  return { success: true, message: "Order notes saved." };
}

/** FormData-compatible wrapper for list page forms */
export async function updateOrderStatusForm(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  await updateOrderStatus({ orderId, status });
}
