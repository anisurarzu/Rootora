import { prisma } from "@/lib/prisma";
import { apiOk, apiOptions, handleApiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

/**
 * Pathao status webhook (optional).
 * Configure this URL in Pathao merchant dashboard when available.
 */
export async function POST(request: Request) {
  try {
    const secret = process.env.PATHAO_WEBHOOK_SECRET?.trim();
    if (secret) {
      const header =
        request.headers.get("x-pathao-signature") ||
        request.headers.get("authorization") ||
        "";
      if (!header.includes(secret)) {
        return Response.json(
          { success: false, error: "Unauthorized webhook" },
          { status: 401 }
        );
      }
    }

    const body = (await request.json()) as {
      consignment_id?: string | number;
      merchant_order_id?: string;
      order_status?: string;
      event?: string;
    };

    const consignmentId = body.consignment_id
      ? String(body.consignment_id)
      : null;
    const orderNumber = body.merchant_order_id?.trim() || null;
    const status = body.order_status?.trim() || body.event?.trim() || null;

    if (!consignmentId && !orderNumber) {
      return Response.json(
        { success: false, error: "Missing consignment or order id" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(consignmentId ? [{ pathaoConsignmentId: consignmentId }] : []),
          ...(orderNumber ? [{ orderNumber }] : []),
        ],
      },
    });

    if (!order) {
      return apiOk({ updated: false, reason: "order_not_found" });
    }

    const nextStatus =
      status && /deliver/i.test(status)
        ? ("DELIVERED" as const)
        : status && /cancel/i.test(status)
          ? ("CANCELLED" as const)
          : status && /(picked|transit|hub|ship)/i.test(status)
            ? ("SHIPPED" as const)
            : null;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          pathaoConsignmentId: consignmentId || order.pathaoConsignmentId,
          pathaoStatus: status || order.pathaoStatus,
          pathaoSyncedAt: new Date(),
          ...(nextStatus ? { status: nextStatus } : {}),
        },
      }),
      ...(nextStatus
        ? [
            prisma.orderStatusEvent.create({
              data: {
                orderId: order.id,
                status: nextStatus,
                note: `Pathao webhook: ${status}`,
              },
            }),
          ]
        : []),
    ]);

    return apiOk({ updated: true, orderId: order.id, status });
  } catch (error) {
    return handleApiError(error);
  }
}
