import { formatPrice } from "@/lib/utils";
import type { InvoiceOrder } from "@/features/checkout/invoice-types";

export type { InvoiceOrder } from "@/features/checkout/invoice-types";

export function formatInvoiceDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatInvoiceMoney(amount: number | string) {
  return formatPrice(Number(amount));
}

export const COMPANY = {
  name: "ROOTORA",
  tagline: "Naturally Bangladeshi",
  address: "Dhaka, Bangladesh",
  email: "hello@shoprootora.com",
  phone: "+880 1700-000000",
  website: "shoprootora.com",
} as const;
