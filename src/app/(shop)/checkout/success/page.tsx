import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, Package } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrderForInvoiceAccess } from "@/features/checkout/invoice";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your ROOTORA Cash on Delivery order has been placed.",
};

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{ order?: string; id?: string; token?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  const order = await getOrderForInvoiceAccess({
    orderId: params.id,
    orderNumber: params.order,
    token: params.token,
  });

  if (!order) {
    notFound();
  }

  const invoiceHref = `/checkout/invoice?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(order.accessToken)}`;

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-8 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-semibold text-heading">
            Order placed successfully
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you. Your Cash on Delivery order is confirmed and pending
            fulfillment.
            {!order.userId
              ? " Save this page or download your invoice — you will need the link to view it again."
              : null}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline">#{order.orderNumber}</Badge>
            <Badge>COD</Badge>
            <Badge variant="secondary">{order.status}</Badge>
            {!order.userId ? <Badge variant="outline">Guest</Badge> : null}
          </div>

          <dl className="mt-8 space-y-3 rounded-xl border border-border bg-muted/20 p-5 text-left text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Total to pay on delivery</dt>
              <dd className="font-semibold text-primary">
                {formatPrice(Number(order.total))}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{order.items.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Deliver to</dt>
              <dd className="text-right">
                {order.address.name}
                <br />
                {order.address.addressLine1}, {order.address.district}
              </dd>
            </div>
          </dl>

          <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span className="flex items-center gap-2 text-heading">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {item.product?.name ?? "Unavailable product"}
                </span>
                <span>
                  ×{item.quantity} ·{" "}
                  {formatPrice(Number(item.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={invoiceHref}>
                <Download className="h-4 w-4" />
                Download invoice
              </Link>
            </Button>
            {order.userId ? (
              <Button asChild variant="outline">
                <Link href="/account/orders">View my orders</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/register">Create account</Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
