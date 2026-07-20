"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote, MapPin, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { placeCodOrder } from "@/features/checkout/actions";
import {
  ADDRESS_LABEL_OPTIONS,
  checkoutAddressSchema,
  mapZodErrors,
  type AddressLabelOption,
} from "@/features/checkout/schema";
import { useCartStore } from "@/features/cart/store/cart-store";
import {
  FREE_SHIPPING_THRESHOLD,
  calculateOrderTotals,
} from "@/lib/checkout";
import { formatPrice, cn } from "@/lib/utils";

export type CheckoutAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  district: string;
  postalCode: string;
  isDefault: boolean;
};

type CheckoutFormProps = {
  addresses: CheckoutAddress[];
  defaultName: string;
  defaultPhone: string;
  defaultEmail?: string;
  isGuest?: boolean;
};

type FieldErrors = Record<string, string>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

function resolveAddressLabel(
  labelType: AddressLabelOption,
  customLabel: string
) {
  if (labelType === "Other") {
    return customLabel.trim();
  }
  return labelType;
}

export function CheckoutForm({
  addresses,
  defaultName,
  defaultPhone,
  defaultEmail = "",
  isGuest = false,
}: CheckoutFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { items, clearCart, getSubtotal } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((address) => address.isDefault)?.id ??
      addresses[0]?.id ??
      ""
  );
  const [useNewAddress, setUseNewAddress] = useState(
    isGuest || addresses.length === 0
  );
  const [saveAddress, setSaveAddress] = useState(!isGuest);
  const [notes, setNotes] = useState("");
  const [guestEmail, setGuestEmail] = useState(defaultEmail);
  const [labelType, setLabelType] = useState<AddressLabelOption>("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [newAddress, setNewAddress] = useState({
    name: defaultName,
    phone: defaultPhone,
    addressLine1: "",
    addressLine2: "",
    district: "",
    postalCode: "",
  });

  const subtotal = getSubtotal();
  const totals = useMemo(() => calculateOrderTotals(subtotal), [subtotal]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!useNewAddress && !isGuest && addresses.length > 0) {
      if (!selectedAddressId) {
        nextErrors.addressId = "Please select a delivery address";
      }
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    }

    const label = resolveAddressLabel(labelType, customLabel);
    if (labelType === "Other" && !customLabel.trim()) {
      nextErrors.customLabel = "Please enter a label for this address";
    }

    const parsed = checkoutAddressSchema.safeParse({
      label,
      name: newAddress.name,
      phone: newAddress.phone,
      addressLine1: newAddress.addressLine1,
      addressLine2: newAddress.addressLine2 || undefined,
      district: newAddress.district,
      postalCode: newAddress.postalCode.trim() || undefined,
    });

    if (!parsed.success) {
      Object.assign(nextErrors, mapZodErrors(parsed.error));
    }

    const trimmedGuestEmail = guestEmail.trim();
    if (trimmedGuestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedGuestEmail)) {
      nextErrors.guestEmail = "Enter a valid email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-soft">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 font-heading text-2xl font-semibold text-heading">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products before checking out.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse shop</Link>
        </Button>
      </div>
    );
  }

  function onPlaceOrder() {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before placing your order.");
      return;
    }

    startTransition(async () => {
      const label = resolveAddressLabel(labelType, customLabel);
      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          variantId: item.variantId,
        })),
        notes,
        saveAddress: isGuest ? false : saveAddress,
        guestEmail: guestEmail.trim() || undefined,
        ...(useNewAddress || isGuest
          ? {
              newAddress: {
                label,
                name: newAddress.name.trim(),
                phone: newAddress.phone.trim(),
                addressLine1: newAddress.addressLine1.trim(),
                addressLine2: newAddress.addressLine2.trim() || undefined,
                district: newAddress.district.trim(),
                postalCode: newAddress.postalCode.trim() || undefined,
              },
            }
          : { addressId: selectedAddressId }),
      };

      const result = await placeCodOrder(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      clearCart();
      toast.success(result.message || "Order placed");
      const { orderNumber, orderId, accessToken } = result.data!;
      router.push(
        `/checkout/success?order=${encodeURIComponent(orderNumber)}&id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(accessToken)}`
      );
      router.refresh();
    });
  }

  const inputErrorClass = (field: string) =>
    cn(errors[field] && "border-destructive focus-visible:ring-destructive");

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold text-heading">
                Delivery address
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isGuest
                  ? "Enter where we should deliver your order."
                  : "Choose a saved address or add a new one."}
              </p>
            </div>
            {!isGuest && addresses.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setUseNewAddress((prev) => !prev);
                  setErrors({});
                }}
              >
                <Plus className="h-4 w-4" />
                {useNewAddress ? "Use saved" : "New address"}
              </Button>
            ) : null}
          </div>

          {!useNewAddress && !isGuest && addresses.length > 0 ? (
            <>
              <ul className="mt-5 space-y-3">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                        selectedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/30",
                        errors.addressId && selectedAddressId !== address.id
                          ? "border-destructive/40"
                          : null
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1"
                        checked={selectedAddressId === address.id}
                        onChange={() => {
                          setSelectedAddressId(address.id);
                          clearError("addressId");
                        }}
                      />
                      <span>
                        <span className="flex items-center gap-2 font-button text-sm font-medium text-heading">
                          <MapPin className="h-4 w-4 text-primary" />
                          {address.label}
                          {address.isDefault ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                              Default
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {address.name} · {address.phone}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {address.addressLine1}
                          {address.addressLine2
                            ? `, ${address.addressLine2}`
                            : ""}
                          , {address.district}
                          {address.postalCode ? ` ${address.postalCode}` : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <FieldError message={errors.addressId} />
            </>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressType">
                  Address type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={labelType}
                  onValueChange={(value) => {
                    setLabelType(value as AddressLabelOption);
                    clearError("label");
                    clearError("customLabel");
                  }}
                >
                  <SelectTrigger
                    id="addressType"
                    className={inputErrorClass("label")}
                    aria-invalid={Boolean(errors.label)}
                  >
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDRESS_LABEL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.label} />
              </div>

              {labelType === "Other" ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customLabel">
                    Custom label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customLabel"
                    value={customLabel}
                    placeholder="e.g. Parent's house, Warehouse"
                    className={inputErrorClass("customLabel")}
                    aria-invalid={Boolean(errors.customLabel)}
                    onChange={(event) => {
                      setCustomLabel(event.target.value);
                      clearError("customLabel");
                      clearError("label");
                    }}
                  />
                  <FieldError message={errors.customLabel} />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={newAddress.name}
                  placeholder="Recipient name"
                  autoComplete="name"
                  className={inputErrorClass("name")}
                  aria-invalid={Boolean(errors.name)}
                  onChange={(event) => {
                    setNewAddress((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }));
                    clearError("name");
                  }}
                />
                <FieldError message={errors.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newAddress.phone}
                  placeholder="+8801..."
                  autoComplete="tel"
                  className={inputErrorClass("phone")}
                  aria-invalid={Boolean(errors.phone)}
                  onChange={(event) => {
                    setNewAddress((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }));
                    clearError("phone");
                  }}
                />
                <FieldError message={errors.phone} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine1">
                  Address line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addressLine1"
                  value={newAddress.addressLine1}
                  placeholder="House, road, area"
                  autoComplete="address-line1"
                  className={inputErrorClass("addressLine1")}
                  aria-invalid={Boolean(errors.addressLine1)}
                  onChange={(event) => {
                    setNewAddress((prev) => ({
                      ...prev,
                      addressLine1: event.target.value,
                    }));
                    clearError("addressLine1");
                  }}
                />
                <FieldError message={errors.addressLine1} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
                <Input
                  id="addressLine2"
                  value={newAddress.addressLine2}
                  placeholder="Landmark, floor, etc."
                  autoComplete="address-line2"
                  onChange={(event) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      addressLine2: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">
                  District <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="district"
                  value={newAddress.district}
                  placeholder="Dhaka"
                  autoComplete="address-level2"
                  className={inputErrorClass("district")}
                  aria-invalid={Boolean(errors.district)}
                  onChange={(event) => {
                    setNewAddress((prev) => ({
                      ...prev,
                      district: event.target.value,
                    }));
                    clearError("district");
                  }}
                />
                <FieldError message={errors.district} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code (optional)</Label>
                <Input
                  id="postalCode"
                  value={newAddress.postalCode}
                  placeholder="1205"
                  autoComplete="postal-code"
                  onChange={(event) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      postalCode: event.target.value,
                    }))
                  }
                />
              </div>

              {isGuest ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="guestEmail">Email (optional)</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    placeholder="you@example.com"
                    className={inputErrorClass("guestEmail")}
                    aria-invalid={Boolean(errors.guestEmail)}
                    onChange={(event) => {
                      setGuestEmail(event.target.value);
                      clearError("guestEmail");
                    }}
                  />
                  <FieldError message={errors.guestEmail} />
                  <p className="text-xs text-muted-foreground">
                    Used for order updates. Keep your invoice link to download
                    the receipt later.
                  </p>
                </div>
              ) : (
                <label className="flex items-center gap-2 sm:col-span-2 text-sm">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                  />
                  Save this address to my account
                </label>
              )}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="font-heading text-xl font-semibold text-heading">
            Payment method
          </h2>
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-primary/15 p-2 text-primary">
                <Banknote className="h-5 w-5" />
              </span>
              <div>
                <p className="font-button font-medium text-heading">
                  Cash on Delivery
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pay in cash when your order arrives. No online payment is
                  required for this order.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              placeholder="Delivery instructions, preferred time, etc."
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-heading text-xl font-semibold text-heading">
          Order summary
        </h2>

        <ul className="space-y-3">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-heading">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty {quantity} · {formatPrice(product.price)}
                </p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(product.price * quantity)}
              </p>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            </span>
          </div>
          {totals.subtotal < FREE_SHIPPING_THRESHOLD ? (
            <p className="text-xs text-secondary">
              Add {formatPrice(FREE_SHIPPING_THRESHOLD - totals.subtotal)} more
              for free delivery
            </p>
          ) : null}
          <div className="flex justify-between font-button text-base font-semibold text-heading">
            <span>Total (COD)</span>
            <span className="text-primary">{formatPrice(totals.total)}</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={pending}
          onClick={onPlaceOrder}
        >
          {pending ? "Placing order…" : "Place COD order"}
        </Button>

        <Button variant="ghost" className="w-full" asChild>
          <Link href="/cart">Back to cart</Link>
        </Button>
      </aside>
    </div>
  );
}
