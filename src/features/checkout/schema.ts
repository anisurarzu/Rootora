import { z } from "zod";

export const ADDRESS_LABEL_OPTIONS = ["Home", "Office", "Other"] as const;
export type AddressLabelOption = (typeof ADDRESS_LABEL_OPTIONS)[number];

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  variantId: z.string().optional().nullable(),
});

export const checkoutAddressSchema = z.object({
  label: z.string().trim().min(1, "Please select an address type"),
  name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  addressLine1: z.string().trim().min(3, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  district: z.string().trim().min(2, "District is required"),
  postalCode: z.string().trim().optional(),
});

export const placeOrderInputSchema = z
  .object({
    items: z.array(checkoutItemSchema).min(1, "Your cart is empty").optional(),
    useCart: z.boolean().optional(),
    addressId: z.string().optional(),
    newAddress: checkoutAddressSchema.optional(),
    notes: z.string().max(500).optional(),
    saveAddress: z.boolean().optional(),
    couponCode: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z
        .string()
        .trim()
        .max(40, "Coupon code is too long")
        .optional()
    ),
    guestEmail: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.string().email("Enter a valid email").optional()
    ),
  })
  .refine((data) => Boolean(data.addressId || data.newAddress), {
    message: "Please select or add a delivery address",
    path: ["addressId"],
  });

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;

export function mapZodErrors(error: z.ZodError): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!mapped[key]) {
      mapped[key] = issue.message;
    }
  }
  return mapped;
}
