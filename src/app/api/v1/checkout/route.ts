import { revalidatePath } from "next/cache";
import { requireApiSession, parseJsonBody } from "@/lib/api/auth";
import {
  ApiHttpError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { placeCodOrderForUser } from "@/features/checkout/service";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

/**
 * Place a Cash on Delivery order.
 *
 * Body options:
 * - useCart: true  → checkout items from server cart
 * - items: [...]   → checkout explicit line items
 * - addressId or newAddress
 * - notes, saveAddress
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const body = await parseJsonBody(request);

    const result = await placeCodOrderForUser(user.id, {
      useCart: true,
      ...(typeof body === "object" && body ? body : {}),
    });

    if (!result.success) {
      throw new ApiHttpError(result.error, 400, { code: "CHECKOUT_FAILED" });
    }

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return apiOk(
      {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        accessToken: result.accessToken,
        total: result.total,
        paymentMethod: result.paymentMethod,
        paymentStatus: "PENDING",
        status: "PENDING",
        invoiceUrl: `/checkout/invoice?order=${encodeURIComponent(result.orderNumber)}&token=${encodeURIComponent(result.accessToken)}`,
      },
      {
        status: 201,
        message: "Order placed successfully. Pay cash on delivery.",
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
