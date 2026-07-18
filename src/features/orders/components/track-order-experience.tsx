"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CircleAlert,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  PackageOpen,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, cn } from "@/lib/utils";
import type { TrackingEvent, TrackingStepId } from "@/features/orders/tracking";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  total: number;
  itemCount: number;
  items: Array<{
    id: string;
    name: string;
    slug: string;
    quantity: number;
    image: string | null;
  }>;
  destination: {
    name: string;
    district: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
  steps: Array<{
    id: TrackingStepId;
    label: string;
    description: string;
    shortLabel: string;
  }>;
  currentStepIndex: number;
  progress: number;
  headline: string;
  subheadline: string;
  estimatedDelivery: string | null;
  events: TrackingEvent[];
  isTerminalAlert: boolean;
};

const stepIcons: Record<TrackingStepId, typeof Package> = {
  PENDING: Package,
  CONFIRMED: Check,
  PROCESSING: PackageOpen,
  SHIPPED: Truck,
  DELIVERED: PackageCheck,
};

function imageProps(url: string) {
  const isRemote = url.startsWith("http");
  return {
    unoptimized: isRemote && !url.includes("res.cloudinary.com"),
  };
}

export function TrackOrderExperience() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const hasResult = Boolean(order || error);

  useEffect(() => {
    if (!hasResult) return;
    const frame = requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hasResult, order?.orderNumber, error]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch("/api/v1/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: TrackedOrder;
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.error || "Unable to track this order right now.");
        return;
      }

      setOrder(payload.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgb(53 94 59 / 0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 20%, rgb(169 179 136 / 0.18), transparent 50%), radial-gradient(ellipse 50% 35% at 0% 60%, rgb(115 144 114 / 0.1), transparent 45%)",
        }}
      />

      <div
        className={cn(
          "container-rootora",
          hasResult ? "px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8" : "section-padding"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "mx-auto text-center",
            hasResult ? "max-w-3xl" : "max-w-2xl"
          )}
        >
          {hasResult ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Track order
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Live order tracking
              </p>
              <h1 className="font-heading text-3xl font-semibold text-heading sm:text-4xl md:text-5xl">
                Follow your parcel home
              </h1>
              <p className="mt-4 text-balance text-muted-foreground sm:text-lg">
                Enter your order number to see a live journey — from packing to
                your doorstep.
              </p>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className={cn("mx-auto max-w-xl", hasResult ? "mt-4" : "mt-10")}
        >
          <form
            onSubmit={handleSubmit}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-lift backdrop-blur-sm",
              hasResult ? "p-4 sm:p-5" : "p-6 md:p-8"
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
            />
            <div
              className={cn(
                "relative",
                hasResult
                  ? "flex flex-col gap-3 sm:flex-row sm:items-end"
                  : "space-y-5"
              )}
            >
              <div className={cn("space-y-2", hasResult && "min-w-0 flex-1")}>
                {!hasResult && <Label htmlFor="orderNumber">Order number</Label>}
                {hasResult && (
                  <Label htmlFor="orderNumber" className="sr-only">
                    Order number
                  </Label>
                )}
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. RT-XXXX-XX-XXXX"
                  required
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className={cn(
                    "font-button tracking-wide",
                    hasResult ? "h-12" : "h-14"
                  )}
                />
                {!hasResult && (
                  <p className="text-xs text-muted-foreground">
                    Find it on your checkout confirmation or invoice.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className={cn(
                  "rounded-xl font-semibold",
                  hasResult
                    ? "h-12 w-full shrink-0 sm:w-auto sm:px-6"
                    : "h-14 w-full text-base"
                )}
                disabled={loading || !orderNumber.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Finding…" : hasResult ? "Track again" : "Track my order"}
              </Button>
            </div>
          </form>
        </motion.div>

        <div ref={resultRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="mx-auto mt-5 max-w-xl rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center sm:p-6"
              >
                <CircleAlert className="mx-auto h-8 w-8 text-destructive" />
                <p className="mt-3 font-heading text-lg font-semibold text-heading">
                  Order not found
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Use the order number from your confirmation screen or invoice.
                </p>
              </motion.div>
            )}

            {order && (
              <motion.div
                key={order.orderNumber}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-5 max-w-3xl space-y-5"
              >
                <TrackingJourneyCard order={order} />
                <OrderDetailsCard order={order} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TrackingJourneyCard({ order }: { order: TrackedOrder }) {
  const activeIndex = Math.max(0, order.currentStepIndex);
  const packageProgress =
    order.currentStepIndex < 0
      ? 0
      : order.steps.length <= 1
        ? 100
        : (order.currentStepIndex / (order.steps.length - 1)) * 100;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="relative border-b border-border bg-gradient-to-br from-primary/[0.08] via-transparent to-accent/20 px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-button text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {order.orderNumber}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-heading sm:text-3xl">
              {order.headline}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              {order.subheadline}
            </p>
          </div>
          {order.estimatedDelivery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-primary/20 bg-surface/80 px-4 py-3 backdrop-blur-sm"
            >
              <p className="font-button text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Delivery window
              </p>
              <p className="mt-1 text-sm font-medium text-heading">
                {order.estimatedDelivery}
              </p>
            </motion.div>
          )}
        </div>

        {!order.isTerminalAlert && (
          <div className="mt-8">
            <div className="relative px-1 sm:px-3">
              <div className="absolute left-[10%] right-[10%] top-[22px] h-1.5 rounded-full bg-border" />
              <motion.div
                className="absolute top-[22px] h-1.5 rounded-full bg-primary"
                style={{ left: "10%" }}
                initial={{ width: "0%" }}
                animate={{ width: `${packageProgress * 0.8}%` }}
                transition={{
                  duration: 1.1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
              />

              <motion.div
                className="absolute top-[10px] z-20"
                initial={{ left: "10%" }}
                animate={{ left: `${10 + packageProgress * 0.8}%` }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.15,
                }}
                style={{ x: "-50%" }}
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift">
                  <Truck className="h-4 w-4" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                </div>
              </motion.div>

              <div className="relative z-10 grid grid-cols-5 gap-1">
                {order.steps.map((step, index) => {
                  const Icon = stepIcons[step.id];
                  const done = index < activeIndex;
                  const active = index === activeIndex;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.08 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors",
                          done &&
                            "border-primary bg-primary text-primary-foreground",
                          active &&
                            "border-primary bg-surface text-primary shadow-[0_0_0_4px_rgb(53_94_59_/_0.15)]",
                          !done &&
                            !active &&
                            "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon
                            className={cn("h-4 w-4", active && "animate-pulse")}
                          />
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-2.5 font-button text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <span className="sm:hidden">{step.shortLabel}</span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Journey progress</span>
                <span className="font-button font-semibold text-primary">
                  {Math.round(order.progress)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${order.progress}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-0 px-5 py-2 sm:px-8">
        {order.events.map((event, index) => (
          <TimelineRow key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ event, index }: { event: TrackingEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.1 }}
      className="relative flex gap-4 border-b border-border/60 py-4 last:border-b-0"
    >
      <div className="relative mt-1 flex flex-col items-center">
        <span
          className={cn(
            "h-3 w-3 rounded-full ring-4",
            event.tone === "done" && "bg-primary ring-primary/15",
            event.tone === "active" && "bg-primary ring-primary/25",
            event.tone === "upcoming" && "bg-border ring-muted",
            event.tone === "alert" && "bg-destructive ring-destructive/20"
          )}
        />
        {event.tone === "active" && (
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-primary/50" />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p
            className={cn(
              "font-button text-sm font-semibold",
              event.tone === "active" && "text-primary",
              event.tone === "alert" && "text-destructive",
              event.tone === "upcoming" && "text-muted-foreground",
              event.tone === "done" && "text-heading"
            )}
          >
            {event.title}
          </p>
          <p className="text-xs text-muted-foreground">{event.at}</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
      </div>
    </motion.div>
  );
}

function OrderDetailsCard({ order }: { order: TrackedOrder }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-4 w-4" />
          <p className="font-button text-xs font-semibold uppercase tracking-wider">
            Delivering to
          </p>
        </div>
        <p className="mt-3 font-heading text-lg font-semibold text-heading">
          {order.destination.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.destination.district}
          {order.destination.postalCode
            ? ` · ${order.destination.postalCode}`
            : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {order.paymentStatus}
          </span>
          {order.paymentMethod && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {order.paymentMethod}
            </span>
          )}
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-2 text-primary">
          <Package className="h-4 w-4" />
          <p className="font-button text-xs font-semibold uppercase tracking-wider">
            In this order · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <ul className="mt-3 space-y-3">
          {order.items.slice(0, 4).map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    {...imageProps(item.image)}
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/shop/${item.slug}`}
                  className="line-clamp-1 text-sm font-medium text-heading hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
        {order.items.length > 4 && (
          <p className="mt-3 text-xs text-muted-foreground">
            +{order.items.length - 4} more item{order.items.length - 4 === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </motion.div>
  );
}
