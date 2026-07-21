"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { updateOrderStatus, softDeleteOrder } from "@/features/admin/actions/orders";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import { PathaoCourierButton } from "@/features/shipping/pathao/pathao-courier-button";
import { formatBdDate } from "@/lib/datetime";
import { cn, formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  guestEmail: string | null;
  itemCount: number;
  productSummary: string;
  productThumbnails: string[];
  districtHint: string | null;
  pathaoConsignmentId: string | null;
  pathaoStatus: string | null;
  pathaoDeliveryFee: number | null;
  user: { name: string | null; email: string } | null;
};

type AdminOrdersTableProps = {
  orders: AdminOrderRow[];
};

function statusMapFromOrders(orders: AdminOrderRow[]) {
  return Object.fromEntries(
    orders.map((order) => [order.id, order.status])
  ) as Record<string, OrderStatus>;
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrderRow | null>(null);
  const [draftStatus, setDraftStatus] = useState(() =>
    statusMapFromOrders(orders)
  );

  useEffect(() => {
    setDraftStatus(statusMapFromOrders(orders));
  }, [orders]);

  function handleSave(orderId: string) {
    const status = draftStatus[orderId];
    if (!status) return;

    setSavingId(orderId);
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, status });
      if (!result.success) {
        toast.error(result.error);
        setSavingId(null);
        return;
      }

      toast.success(result.message);
      router.refresh();
      setSavingId(null);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const orderId = deleteTarget.id;

    startTransition(async () => {
      const result = await softDeleteOrder({ orderId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  if (orders.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="whitespace-nowrap px-2 py-2.5 font-button font-medium text-muted-foreground">
              Order
            </th>
            <th className="min-w-[180px] px-2 py-2.5 font-button font-medium text-muted-foreground">
              Products
            </th>
            <th className="min-w-[120px] px-2 py-2.5 font-button font-medium text-muted-foreground">
              Customer
            </th>
            <th className="whitespace-nowrap px-2 py-2.5 font-button font-medium text-muted-foreground">
              Payment
            </th>
            <th className="whitespace-nowrap px-2 py-2.5 font-button font-medium text-muted-foreground">
              Total
            </th>
            <th className="whitespace-nowrap px-2 py-2.5 font-button font-medium text-muted-foreground">
              Status
            </th>
            <th className="whitespace-nowrap px-2 py-2.5 font-button font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isSaving =
              savingId === order.id ||
              (pending && deleteTarget?.id === order.id);
            const thumbs = order.productThumbnails ?? [];
            return (
              <tr
                key={`${order.id}-${order.status}`}
                className={cn(
                  "border-b border-border last:border-0",
                  isSaving && "bg-muted/40"
                )}
              >
                <td className="whitespace-nowrap px-2 py-2.5 font-medium text-heading">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatBdDate(order.createdAt)}
                  </p>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex shrink-0 -space-x-1.5">
                      {(thumbs.length > 0 ? thumbs.slice(0, 3) : [null]).map(
                        (thumb, index) => (
                          <div
                            key={`${order.id}-thumb-${index}`}
                            className="relative h-8 w-8 overflow-hidden rounded-md border border-border bg-muted"
                          >
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                N/A
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-heading">
                        {order.productSummary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.itemCount} item
                        {order.itemCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-[140px] px-2 py-2.5">
                  <span className="block truncate text-heading">
                    {order.user?.name ?? "Guest"}
                  </span>
                  <span className="block truncate text-muted-foreground">
                    {order.user?.email ?? order.guestEmail ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-2.5">
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 font-medium">
                  {formatPrice(order.total)}
                </td>
                <td className="px-2 py-2.5">
                  {isSaving ? (
                    <div
                      className="flex flex-nowrap items-center gap-1.5"
                      aria-busy="true"
                      aria-live="polite"
                    >
                      <Skeleton className="h-8 w-24 shrink-0" />
                      <Skeleton className="h-8 w-12 shrink-0" />
                      <Skeleton className="h-8 w-16 shrink-0" />
                    </div>
                  ) : (
                    <div className="flex flex-nowrap items-center gap-1.5">
                      <label htmlFor={`status-${order.id}`} className="sr-only">
                        Status for order {order.orderNumber}
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={draftStatus[order.id] ?? order.status}
                        onChange={(event) =>
                          setDraftStatus((prev) => ({
                            ...prev,
                            [order.id]: event.target.value as OrderStatus,
                          }))
                        }
                        className="h-8 w-[110px] shrink-0 rounded-lg border border-input bg-surface px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0 px-2"
                        onClick={() => handleSave(order.id)}
                      >
                        Save
                      </Button>
                      <PathaoCourierButton
                        orderId={order.id}
                        orderStatus={order.status}
                        districtHint={order.districtHint ?? undefined}
                        pathaoConsignmentId={order.pathaoConsignmentId}
                        pathaoStatus={order.pathaoStatus}
                        pathaoDeliveryFee={order.pathaoDeliveryFee}
                      />
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 py-2.5">
                  <div className="flex flex-nowrap items-center gap-0.5">
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-8 shrink-0 px-2"
                    >
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 shrink-0 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isSaving}
                      onClick={() => setDeleteTarget(order)}
                      aria-label={`Delete order ${order.orderNumber}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !pending && setDeleteTarget(null)}
        title="Delete order?"
        description={
          deleteTarget
            ? `Are you sure you want to delete order #${deleteTarget.orderNumber}?`
            : ""
        }
        confirmLabel="Delete order"
        tone="danger"
        loading={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
