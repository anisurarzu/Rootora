import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { InvoiceDocument } from "@/features/checkout/components/invoice-document";
import { getOrderForInvoiceAccess } from "@/features/checkout/invoice";

export const metadata: Metadata = {
  title: "Invoice",
  description: "ROOTORA order invoice / receipt.",
};

export const dynamic = "force-dynamic";

type InvoicePageProps = {
  searchParams: Promise<{ order?: string; id?: string; token?: string }>;
};

export default async function CheckoutInvoicePage({
  searchParams,
}: InvoicePageProps) {
  const params = await searchParams;

  const order = await getOrderForInvoiceAccess({
    orderId: params.id,
    orderNumber: params.order,
    token: params.token,
  });

  if (!order) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h1 className="font-body text-2xl font-semibold text-heading">
              Invoice
            </h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Order{" "}
              <span className="font-medium tabular-nums text-foreground">
                {order.orderNumber}
              </span>{" "}
              · Print or download PDF to save a copy.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link
              href={`/checkout/success?order=${encodeURIComponent(order.orderNumber)}&id=${encodeURIComponent(order.id)}&token=${encodeURIComponent(order.accessToken)}`}
            >
              Back to confirmation
            </Link>
          </Button>
        </div>

        <InvoiceDocument order={order} />
      </div>
    </MainLayout>
  );
}
