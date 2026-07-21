"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/features/admin/types";
import { resolveCoupon } from "@/features/checkout/coupon";
import { placeCodOrder as createCodOrder } from "@/features/checkout/service";
import { getSession } from "@/lib/auth-server";

export type PlaceOrderResult = ActionResult<{
  orderId: string;
  orderNumber: string;
  accessToken: string;
}>;

export type ApplyCouponResult = ActionResult<{
  code: string;
  discount: number;
}>;

export async function applyCheckoutCoupon(
  code: string,
  subtotal: number
): Promise<ApplyCouponResult> {
  const result = await resolveCoupon(code, subtotal);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  if (!result.coupon) {
    return { success: false, error: "Enter a coupon code." };
  }

  return {
    success: true,
    data: {
      code: result.coupon.code,
      discount: result.coupon.discount,
    },
    message: `Coupon ${result.coupon.code} applied.`,
  };
}

export async function placeCodOrder(input: unknown): Promise<PlaceOrderResult> {
  const session = await getSession();
  const result = await createCodOrder(session?.user?.id ?? null, input);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/checkout");

  return {
    success: true,
    data: {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      accessToken: result.accessToken,
    },
    message: "Order placed successfully. Pay cash on delivery.",
  };
}
