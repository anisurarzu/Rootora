import { z } from "zod";
import {
  ApiHttpError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import { buildTrackingTimeline } from "@/features/orders/tracking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const trackSchema = z.object({
  orderNumber: z.string().trim().min(3).max(64),
});

/** Normalize user input: trim, upper, collapse spaces/dashes noise. */
function normalizeOrderNumber(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = trackSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiHttpError("Enter a valid order number.", 400, {
        code: "VALIDATION_ERROR",
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const orderNumber = normalizeOrderNumber(parsed.data.orderNumber);

    const order = await prisma.order.findFirst({
      where: {
        ...activeOrderWhere,
        orderNumber: {
          equals: orderNumber,
          mode: "insensitive",
        },
      },
      include: {
        address: true,
        statusEvents: {
          orderBy: { createdAt: "asc" },
          select: { status: true, createdAt: true },
        },
        items: {
          include: {
            product: {
              select: {
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
      throw new ApiHttpError(
        "We couldn't find an order with that number. Check the number on your confirmation or invoice.",
        404,
        { code: "NOT_FOUND" }
      );
    }

    // Backfill history for older orders that predate status events
    let statusEvents = order.statusEvents;
    if (statusEvents.length === 0) {
      await prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: "PENDING",
          createdAt: order.createdAt,
        },
      });
      if (order.status !== "PENDING") {
        await prisma.orderStatusEvent.create({
          data: {
            orderId: order.id,
            status: order.status,
            createdAt: order.updatedAt,
          },
        });
      }
      statusEvents = await prisma.orderStatusEvent.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: "asc" },
        select: { status: true, createdAt: true },
      });
    }

    const timeline = buildTrackingTimeline({
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      district: order.address.district,
      statusEvents: statusEvents.map((event) => ({
        status: event.status,
        at: event.createdAt,
      })),
    });

    return apiOk({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: Number(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        slug: item.product.slug,
        quantity: item.quantity,
        image: item.product.thumbnail || item.product.images[0] || null,
      })),
      destination: {
        name: order.address.name,
        district: order.address.district,
        postalCode: order.address.postalCode,
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      ...timeline,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
