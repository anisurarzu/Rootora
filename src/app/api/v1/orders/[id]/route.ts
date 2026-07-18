import { requireApiSession } from "@/lib/api/auth";
import {
  ApiHttpError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { user } = await requireApiSession(request);
    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        ...activeOrderWhere,
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiHttpError("Order not found", 404, { code: "NOT_FOUND" });
    }

    return apiOk({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      notes: order.notes,
      address: {
        id: order.address.id,
        label: order.address.label,
        name: order.address.name,
        phone: order.address.phone,
        addressLine1: order.address.addressLine1,
        addressLine2: order.address.addressLine2,
        district: order.address.district,
        postalCode: order.address.postalCode,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        lineTotal: Number(item.price) * item.quantity,
        variantId: item.variantId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.thumbnail || item.product.images[0] || null,
        },
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
