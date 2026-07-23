"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
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
  const paymentLabel = order.paymentMethod ?? "Cash on Delivery";
  const issuedOn = formatInvoiceDate(order.createdAt);

  return (
    <div className="mx-auto max-w-[800px] font-body">
      {showActions ? (
        <div className="mb-5 flex flex-wrap items-center justify-end gap-2 print:hidden">
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
        className="border border-neutral-200 bg-white text-neutral-900 shadow-sm print:border-0 print:shadow-none"
      >
        <div className="h-1.5 w-full bg-[#355E3B]" />

        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <header className="flex flex-col gap-8 border-b border-neutral-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-heading text-3xl font-bold tracking-tight text-[#355E3B]">
                {siteConfig.name}
              </p>
              <p className="mt-1 font-heading text-base italic text-[#739072]">
                {siteConfig.tagline}
              </p>
              <div className="mt-4 space-y-0.5 text-[12px] leading-5 text-neutral-600">
                <p>{COMPANY.address}</p>
                <p>{COMPANY.email}</p>
                {COMPANY.phone ? <p>{COMPANY.phone}</p> : null}
                <p>{COMPANY.website}</p>
              </div>
            </div>

            <div className="sm:min-w-[240px] sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Tax Invoice
              </p>
              <p className="mt-1 text-[28px] font-semibold leading-none text-neutral-900">
                INVOICE
              </p>
              <dl className="mt-5 space-y-1.5 sm:ml-auto sm:max-w-[260px]">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 text-[13px] sm:text-right">
                  <dt className="text-neutral-500 sm:text-left">Invoice No.</dt>
                  <dd className="font-semibold tabular-nums tracking-normal text-neutral-900">
                    {order.orderNumber}
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 text-[13px] sm:text-right">
                  <dt className="text-neutral-500 sm:text-left">Date</dt>
                  <dd className="font-medium text-neutral-900">{issuedOn}</dd>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 text-[13px] sm:text-right">
                  <dt className="text-neutral-500 sm:text-left">Payment</dt>
                  <dd className="font-medium text-neutral-900">{paymentLabel}</dd>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 text-[13px] sm:text-right">
                  <dt className="text-neutral-500 sm:text-left">Status</dt>
                  <dd className="font-medium text-neutral-900">
                    {order.paymentStatus} / {order.status}
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          {/* Parties */}
          <section className="mt-7 grid gap-6 border-b border-neutral-200 pb-7 sm:grid-cols-2">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Bill to
              </h2>
              <div className="mt-2.5 space-y-0.5 text-[13px] leading-6 text-neutral-700">
                <p className="font-semibold text-neutral-900">{billToName}</p>
                {billToEmail ? <p>{billToEmail}</p> : null}
                <p>{order.address.phone}</p>
                {!order.userId ? (
                  <p className="text-[12px] text-neutral-500">Guest checkout</p>
                ) : null}
              </div>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Ship to
              </h2>
              <div className="mt-2.5 space-y-0.5 text-[13px] leading-6 text-neutral-700">
                <p className="font-semibold text-neutral-900">
                  {order.address.name}
                </p>
                <p>{order.address.phone}</p>
                <p>
                  {order.address.addressLine1}
                  {order.address.addressLine2
                    ? `, ${order.address.addressLine2}`
                    : ""}
                </p>
                <p>
                  {order.address.district} {order.address.postalCode}
                </p>
                <p>Bangladesh</p>
              </div>
            </div>
          </section>

          {/* Line items */}
          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-left">
                  <th className="w-10 py-3 pr-2 font-semibold text-neutral-900">
                    #
                  </th>
                  <th className="py-3 pr-3 font-semibold text-neutral-900">
                    Description
                  </th>
                  <th className="w-20 py-3 pr-3 text-right font-semibold text-neutral-900">
                    Qty
                  </th>
                  <th className="w-28 py-3 pr-3 text-right font-semibold text-neutral-900">
                    Unit price
                  </th>
                  <th className="w-28 py-3 text-right font-semibold text-neutral-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => {
                  const lineTotal = Number(item.price) * item.quantity;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-neutral-200 align-top"
                    >
                      <td className="py-3.5 pr-2 tabular-nums text-neutral-500">
                        {index + 1}
                      </td>
                      <td className="py-3.5 pr-3">
                        <p className="font-medium text-neutral-900">
                          {item.product.name}
                        </p>
                        {item.product.sku ? (
                          <p className="mt-0.5 text-[12px] text-neutral-500">
                            SKU: {item.product.sku}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3.5 pr-3 text-right tabular-nums text-neutral-700">
                        {item.quantity}
                        {item.product.unit ? ` ${item.product.unit}` : ""}
                      </td>
                      <td className="py-3.5 pr-3 text-right tabular-nums text-neutral-700">
                        {formatInvoiceMoney(Number(item.price))}
                      </td>
                      <td className="py-3.5 text-right font-medium tabular-nums text-neutral-900">
                        {formatInvoiceMoney(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <section className="mt-6 flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div className="max-w-sm text-[12px] leading-5 text-neutral-500">
              <p className="font-semibold uppercase tracking-[0.1em] text-neutral-600">
                Payment terms
              </p>
              <p className="mt-1.5">
                Cash on Delivery. Please pay the total amount to the delivery
                agent upon receipt of goods. This document is computer-generated
                and does not require a signature.
              </p>
            </div>

            <dl className="w-full max-w-[280px] space-y-2 text-[13px]">
              <div className="flex justify-between gap-8">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="tabular-nums text-neutral-900">
                  {formatInvoiceMoney(Number(order.subtotal))}
                </dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt className="text-neutral-500">Shipping</dt>
                <dd className="tabular-nums text-neutral-900">
                  {Number(order.shipping) === 0
                    ? "Free"
                    : formatInvoiceMoney(Number(order.shipping))}
                </dd>
              </div>
              {Number(order.discount) > 0 ? (
                <div className="flex justify-between gap-8">
                  <dt className="text-neutral-500">Discount</dt>
                  <dd className="tabular-nums text-neutral-900">
                    −{formatInvoiceMoney(Number(order.discount))}
                  </dd>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between gap-8 border-t-2 border-neutral-900 pt-3 text-[15px] font-semibold">
                <dt className="text-neutral-900">Total due</dt>
                <dd className="tabular-nums text-neutral-900">
                  {formatInvoiceMoney(Number(order.total))}
                </dd>
              </div>
            </dl>
          </section>

          {order.notes ? (
            <section className="mt-7 border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13px] text-neutral-700">
              <p className="font-semibold text-neutral-900">Notes</p>
              <p className="mt-1 leading-6">{order.notes}</p>
            </section>
          ) : null}

          <footer className="mt-10 border-t border-neutral-200 pt-5 text-[12px] leading-5 text-neutral-500">
            <p>
              Thank you for shopping with {COMPANY.name}. For support, contact{" "}
              {COMPANY.email}.
            </p>
            <p className="mt-1">
              Invoice No.{" "}
              <span className="font-medium tabular-nums text-neutral-700">
                {order.orderNumber}
              </span>{" "}
              · Issued {issuedOn}
            </p>
          </footer>
        </div>
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
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            margin: 12mm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
