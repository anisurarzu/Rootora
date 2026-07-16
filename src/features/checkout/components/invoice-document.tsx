"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COMPANY,
  formatInvoiceDate,
  formatInvoiceMoney,
  type InvoiceOrder,
} from "@/features/checkout/invoice-shared";

type InvoiceDocumentProps = {
  order: InvoiceOrder;
  showActions?: boolean;
};

export function InvoiceDocument({
  order,
  showActions = true,
}: InvoiceDocumentProps) {
  const billToName = order.address.name;
  const billToEmail = order.guestEmail || order.user?.email || null;

  return (
    <div className="mx-auto max-w-3xl">
      {showActions ? (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2 print:hidden">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button type="button" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      ) : null}

      <article
        id="invoice-document"
        className="rounded-xl border border-border bg-white p-8 text-slate-900 shadow-soft print:rounded-none print:border-0 print:shadow-none sm:p-10"
      >
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-3xl font-semibold tracking-tight text-[#355E3B]">
              {COMPANY.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">{COMPANY.tagline}</p>
            <div className="mt-4 space-y-0.5 text-sm text-slate-600">
              <p>{COMPANY.address}</p>
              <p>{COMPANY.email}</p>
              <p>{COMPANY.phone}</p>
              <p>{COMPANY.website}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Tax Invoice / Receipt
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
              {order.orderNumber}
            </p>
            <dl className="mt-4 space-y-1 text-sm text-slate-600">
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-slate-500">Invoice date</dt>
                <dd>{formatInvoiceDate(order.createdAt)}</dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-slate-500">Payment</dt>
                <dd>{order.paymentMethod ?? "COD"}</dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  {order.paymentStatus} / {order.status}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Bill to
            </h2>
            <div className="mt-2 space-y-0.5 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{billToName}</p>
              {billToEmail ? <p>{billToEmail}</p> : null}
              <p>{order.address.phone}</p>
              {!order.userId ? (
                <p className="text-xs text-slate-500">Guest checkout</p>
              ) : null}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Ship to
            </h2>
            <div className="mt-2 space-y-0.5 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{order.address.name}</p>
              <p>{order.address.phone}</p>
              <p>
                {order.address.addressLine1}
                {order.address.addressLine2
                  ? `, ${order.address.addressLine2}`
                  : ""}
              </p>
              <p>
                {order.address.district}, {order.address.postalCode}
              </p>
              <p>Bangladesh</p>
            </div>
          </div>
        </section>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left">
                <th className="px-3 py-3 font-medium text-slate-600">#</th>
                <th className="px-3 py-3 font-medium text-slate-600">Item</th>
                <th className="px-3 py-3 font-medium text-slate-600">Qty</th>
                <th className="px-3 py-3 font-medium text-slate-600">Unit price</th>
                <th className="px-3 py-3 text-right font-medium text-slate-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const lineTotal = Number(item.price) * item.quantity;
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">
                        {item.product.name}
                      </p>
                      {item.product.sku ? (
                        <p className="text-xs text-slate-500">
                          SKU: {item.product.sku}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {item.quantity}
                      {item.product.unit ? ` ${item.product.unit}` : ""}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {formatInvoiceMoney(Number(item.price))}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                      {formatInvoiceMoney(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <section className="mt-8 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{formatInvoiceMoney(Number(order.subtotal))}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-slate-500">Shipping</dt>
              <dd>
                {Number(order.shipping) === 0
                  ? "Free"
                  : formatInvoiceMoney(Number(order.shipping))}
              </dd>
            </div>
            {Number(order.discount) > 0 ? (
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Discount</dt>
                <dd>-{formatInvoiceMoney(Number(order.discount))}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-6 border-t border-slate-200 pt-3 font-heading text-lg font-semibold text-slate-900">
              <dt>Total due (COD)</dt>
              <dd>{formatInvoiceMoney(Number(order.total))}</dd>
            </div>
          </dl>
        </section>

        {order.notes ? (
          <section className="mt-8 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Order notes</p>
            <p className="mt-1">{order.notes}</p>
          </section>
        ) : null}

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
          <p>
            This is a computer-generated invoice for your ROOTORA Cash on
            Delivery order. Please pay the total amount to the delivery agent
            upon receipt of goods.
          </p>
          <p className="mt-2">
            Thank you for shopping with {COMPANY.name}. For support, contact{" "}
            {COMPANY.email}.
          </p>
        </footer>
      </article>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-document,
          #invoice-document * {
            visibility: visible !important;
          }
          #invoice-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}
