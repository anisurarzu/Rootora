"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  softDeleteOrder,
  updateOrderNotes,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/features/admin/actions/orders";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import { PathaoCourierButton } from "@/features/shipping/pathao/pathao-courier-button";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

type OrderActionsProps = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  canManage: boolean;
  districtHint?: string;
  pathaoConsignmentId: string | null;
  pathaoStatus: string | null;
  pathaoDeliveryFee: number | null;
};

export function OrderActions({
  orderId,
  orderNumber,
  status,
  paymentStatus,
  notes,
  canManage,
  districtHint,
  pathaoConsignmentId,
  pathaoStatus,
  pathaoDeliveryFee,
}: OrderActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentPayment, setCurrentPayment] = useState(paymentStatus);
  const [currentNotes, setCurrentNotes] = useState(notes ?? "");

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  useEffect(() => {
    setCurrentPayment(paymentStatus);
  }, [paymentStatus]);

  useEffect(() => {
    setCurrentNotes(notes ?? "");
  }, [notes]);

  if (pending && !deleteOpen) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <p className="font-button text-sm font-medium">Fulfillment status</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={currentStatus}
              onValueChange={(value) => setCurrentStatus(value as OrderStatus)}
              disabled={!canManage}
            >
              <SelectTrigger className="w-full sm:min-w-0 sm:flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 sm:w-auto"
              disabled={!canManage}
              onClick={() =>
                startTransition(async () => {
                  const result = await updateOrderStatus({
                    orderId,
                    status: currentStatus,
                  });
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                })
              }
            >
              Save
            </Button>
          </div>
          {canManage ? (
            <div className="pt-1">
              <PathaoCourierButton
                orderId={orderId}
                orderStatus={status}
                districtHint={districtHint}
                pathaoConsignmentId={pathaoConsignmentId}
                pathaoStatus={pathaoStatus}
                pathaoDeliveryFee={pathaoDeliveryFee}
                size="default"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="font-button text-sm font-medium">Payment status</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={currentPayment}
              onValueChange={(value) =>
                setCurrentPayment(value as PaymentStatus)
              }
              disabled={!canManage}
            >
              <SelectTrigger className="w-full sm:min-w-0 sm:flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 sm:w-auto"
              disabled={!canManage}
              onClick={() =>
                startTransition(async () => {
                  const result = await updatePaymentStatus({
                    orderId,
                    paymentStatus: currentPayment,
                  });
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                })
              }
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-button text-sm font-medium">Admin notes</p>
        <Textarea
          rows={4}
          value={currentNotes}
          disabled={!canManage}
          onChange={(event) => setCurrentNotes(event.target.value)}
        />
        <Button
          type="button"
          disabled={!canManage}
          onClick={() =>
            startTransition(async () => {
              const result = await updateOrderNotes({
                orderId,
                notes: currentNotes,
              });
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              toast.success(result.message);
              router.refresh();
            })
          }
        >
          Save notes
        </Button>
      </div>

      {canManage ? (
        <div className="border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete order
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => !pending && setDeleteOpen(open)}
        title="Delete order?"
        description={`Are you sure you want to delete order #${orderNumber}?`}
        confirmLabel="Delete order"
        tone="danger"
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            const result = await softDeleteOrder({ orderId });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            setDeleteOpen(false);
            router.push("/admin/orders");
            router.refresh();
          })
        }
      />
    </div>
  );
}
