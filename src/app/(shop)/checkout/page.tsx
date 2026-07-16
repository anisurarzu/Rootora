import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your ROOTORA order with Cash on Delivery.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();

  const [addresses, user] = session?.user
    ? await Promise.all([
        prisma.address.findMany({
          where: { userId: session.user.id },
          orderBy: [{ isDefault: "desc" }, { id: "desc" }],
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, phone: true, email: true },
        }),
      ])
    : [[], null];

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Checkout"
          title="Complete your order"
          description="Review your items and place a Cash on Delivery order. Login is optional."
          align="left"
        />

        {!session?.user ? (
          <p className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Checking out as a guest.{" "}
            <Link
              href="/login?next=/checkout"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>{" "}
            to use saved addresses and track orders in your account.
          </p>
        ) : null}

        <CheckoutForm
          isGuest={!session?.user}
          addresses={addresses.map((address) => ({
            id: address.id,
            label: address.label,
            name: address.name,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            district: address.district,
            postalCode: address.postalCode,
            isDefault: address.isDefault,
          }))}
          defaultName={user?.name ?? session?.user?.name ?? ""}
          defaultPhone={user?.phone ?? ""}
          defaultEmail={user?.email ?? ""}
        />
      </div>
    </MainLayout>
  );
}
