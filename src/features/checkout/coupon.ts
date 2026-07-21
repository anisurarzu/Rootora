import { prisma } from "@/lib/prisma";

export type ResolvedCoupon = {
  id: string;
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function computeDiscountAmount(
  discountType: string,
  discountValue: number,
  subtotal: number
) {
  const type = discountType.trim().toLowerCase();
  let amount = 0;

  if (type === "percentage" || type === "percent" || type === "pct") {
    amount = (subtotal * discountValue) / 100;
  } else {
    // fixed / amount / flat
    amount = discountValue;
  }

  return Math.max(0, Math.min(amount, subtotal));
}

/**
 * Validate an optional coupon code against the cart subtotal.
 * Empty code → no coupon (success with null).
 */
export async function resolveCoupon(
  rawCode: string | undefined | null,
  subtotal: number
): Promise<
  | { success: true; coupon: ResolvedCoupon | null }
  | { success: false; error: string }
> {
  const code = typeof rawCode === "string" ? normalizeCode(rawCode) : "";
  if (!code) {
    return { success: true, coupon: null };
  }

  const row = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!row || !row.active) {
    return { success: false, error: "This coupon code is not valid." };
  }

  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { success: false, error: "This coupon has expired." };
  }

  if (row.maxUses != null && row.usedCount >= row.maxUses) {
    return { success: false, error: "This coupon has reached its usage limit." };
  }

  const minOrder = row.minOrder != null ? Number(row.minOrder) : 0;
  if (subtotal < minOrder) {
    return {
      success: false,
      error: `This coupon requires a minimum order of ৳${minOrder.toFixed(0)}.`,
    };
  }

  const discountValue = Number(row.discountValue);
  const discount = computeDiscountAmount(row.discountType, discountValue, subtotal);

  if (discount <= 0) {
    return { success: false, error: "This coupon does not apply to your order." };
  }

  return {
    success: true,
    coupon: {
      id: row.id,
      code: row.code,
      discount,
      discountType: row.discountType,
      discountValue,
    },
  };
}
