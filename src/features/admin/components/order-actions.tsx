"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateOrderNotes,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/features/admin/actions/orders";

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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  canManage: boolean;
};

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  notes,
  canManage,
}: OrderActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentPayment, setCurrentPayment] = useState(paymentStatus);
  const [currentNotes, setCurrentNotes] = useState(notes ?? "");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="font-button text-sm font-medium">Fulfillment status</p>
          <div className="flex gap-2">
            <Select
              value={currentStatus}
              onValueChange={(value) => setCurrentStatus(value as OrderStatus)}
              disabled={!canManage || pending}
            >
              <SelectTrigger>
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
              disabled={!canManage || pending}
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
        </div>

        <div className="space-y-2">
          <p className="font-button text-sm font-medium">Payment status</p>
          <div className="flex gap-2">
            <Select
              value={currentPayment}
              onValueChange={(value) =>
                setCurrentPayment(value as PaymentStatus)
              }
              disabled={!canManage || pending}
            >
              <SelectTrigger>
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
              disabled={!canManage || pending}
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
          disabled={!canManage || pending}
          onChange={(event) => setCurrentNotes(event.target.value)}
        />
        <Button
          type="button"
          disabled={!canManage || pending}
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
    </div>
  );
}
