import { formatPrice } from "@/lib/utils";
import { formatBdDate, type DateInput } from "@/lib/datetime";
import { siteConfig } from "@/config/site";
import type { InvoiceOrder } from "@/features/checkout/invoice-types";

export type { InvoiceOrder } from "@/features/checkout/invoice-types";

export function formatInvoiceDate(date: DateInput) {
  return formatBdDate(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatInvoiceMoney(amount: number | string) {
  return formatPrice(Number(amount));
}

export const COMPANY = {
  name: siteConfig.name,
  tagline: siteConfig.tagline.replace(/\.$/, ""),
  address: siteConfig.contact.address,
  email: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  website: "shoprootora.com",
} as const;
