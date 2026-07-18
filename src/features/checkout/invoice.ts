import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import type { InvoiceOrder } from "@/features/checkout/invoice-types";
import { activeOrderWhere } from "@/features/orders/order-status-code";

export type { InvoiceOrder } from "@/features/checkout/invoice-types";
export {
  COMPANY,
  formatInvoiceDate,
  formatInvoiceMoney,
} from "@/features/checkout/invoice-shared";

function serializeInvoiceOrder(order: {
  id: string;
  orderNumber: string;
  userId: string | null;
  accessToken: string;
  guestEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: { toString(): string } | number;
  shipping: { toString(): string } | number;
  discount: { toString(): string } | number;
  total: { toString(): string } | number;
  notes: string | null;
  createdAt: Date;
  address: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    district: string;
    postalCode: string;
  };
  user: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: { toString(): string } | number;
    product: {
      name: string;
      sku: string | null;
      unit: string | null;
    };
  }>;
}): InvoiceOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    accessToken: order.accessToken,
    guestEmail: order.guestEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    discount: Number(order.discount),
    total: Number(order.total),
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    address: {
      name: order.address.name,
      phone: order.address.phone,
      addressLine1: order.address.addressLine1,
      addressLine2: order.address.addressLine2,
      district: order.address.district,
      postalCode: order.address.postalCode,
    },
    user: order.user
      ? {
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        name: item.product.name,
        sku: item.product.sku,
        unit: item.product.unit,
      },
    })),
  };
}

export async function getOrderForInvoiceAccess(options: {
  orderId?: string;
  orderNumber?: string;
  token?: string;
}): Promise<InvoiceOrder | null> {
  const { orderId, orderNumber, token } = options;
  if (!orderId && !orderNumber) return null;

  const session = await getSession();

  const order = await prisma.order.findFirst({
    where: {
      ...activeOrderWhere,
      OR: [
        orderId ? { id: orderId } : undefined,
        orderNumber ? { orderNumber } : undefined,
      ].filter(Boolean) as Array<{ id: string } | { orderNumber: string }>,
    },
    include: {
      address: true,
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true, unit: true } },
        },
      },
    },
  });

  if (!order) return null;

  const ownsOrder =
    Boolean(session?.user?.id) && order.userId === session?.user?.id;
  const validToken = Boolean(token) && order.accessToken === token;

  if (!ownsOrder && !validToken) {
    return null;
  }

  return serializeInvoiceOrder(order);
}
