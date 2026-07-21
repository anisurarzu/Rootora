"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PathaoShipCard } from "@/features/shipping/pathao/pathao-ship-card";
import { cn } from "@/lib/utils";

type PathaoCourierButtonProps = {
  orderId: string;
  orderStatus: string;
  districtHint?: string;
  pathaoConsignmentId: string | null;
  pathaoStatus: string | null;
  pathaoDeliveryFee: number | null;
  disabled?: boolean;
  size?: "default" | "sm";
};

export function PathaoCourierButton({
  orderId,
  orderStatus,
  districtHint,
  pathaoConsignmentId,
  pathaoStatus,
  pathaoDeliveryFee,
  disabled = false,
  size = "sm",
}: PathaoCourierButtonProps) {
  const [open, setOpen] = useState(false);
  const enabled = !disabled && orderStatus === "PROCESSING";

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={!enabled}
        title={
          enabled
            ? "Create Pathao shipment"
            : "Available when status is PROCESSING"
        }
        onClick={() => setOpen(true)}
        className={cn(
          "shrink-0 gap-1.5 border-[#E23744]/30 px-2.5 text-[#B91C2C] hover:bg-[#E23744]/10 hover:text-[#9F1239]",
          "disabled:border-border disabled:text-muted-foreground",
          enabled && "pathao-btn-glow",
        )}
      >
        <Image
          src="/images/couriers/pathao.png"
          alt=""
          width={16}
          height={16}
          className={cn(
            "h-4 w-4 rounded-full object-cover",
            enabled && "pathao-mark-ride",
          )}
        />
        Pathao
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Pathao Courier</DialogTitle>
            <DialogDescription>
              Create or refresh Pathao shipment for this order.
            </DialogDescription>
          </DialogHeader>
          <PathaoShipCard
            orderId={orderId}
            districtHint={districtHint}
            pathaoConsignmentId={pathaoConsignmentId}
            pathaoStatus={pathaoStatus}
            pathaoDeliveryFee={pathaoDeliveryFee}
            canManage
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
