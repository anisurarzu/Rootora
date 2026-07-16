export const FREE_SHIPPING_THRESHOLD = 2000;
export const STANDARD_SHIPPING_FEE = 120;

export function calculateShipping(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function calculateOrderTotals(subtotal: number, discount = 0) {
  const shipping = calculateShipping(subtotal);
  const safeDiscount = Math.max(0, Math.min(discount, subtotal));
  const total = Math.max(0, subtotal - safeDiscount + shipping);

  return {
    subtotal,
    shipping,
    discount: safeDiscount,
    total,
  };
}

/** Prefix for today's orders: RT-{year}-{day}- */
export function getOrderNumberPrefix(date = new Date()) {
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");
  return `RT-${year}-${day}-`;
}

/**
 * Format: RT-year-day-no
 * Example: RT-2026-16-0001
 */
export function generateOrderNumber(sequence: number, date = new Date()) {
  const no = String(Math.max(1, sequence)).padStart(4, "0");
  return `${getOrderNumberPrefix(date)}${no}`;
}
