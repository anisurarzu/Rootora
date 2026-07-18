import type { OrderStatus } from "@prisma/client";
import { formatBdDate, formatBdDateTime } from "@/lib/datetime";

export type TrackingStepId =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED";

export type TrackingStep = {
  id: TrackingStepId;
  label: string;
  description: string;
  shortLabel: string;
};

export type TrackingEvent = {
  id: string;
  title: string;
  detail: string;
  at: string;
  tone: "done" | "active" | "upcoming" | "alert";
};

export type TrackingStatusEvent = {
  status: OrderStatus;
  at: Date;
};

export type TrackingTimeline = {
  steps: TrackingStep[];
  currentStepIndex: number;
  progress: number;
  headline: string;
  subheadline: string;
  estimatedDelivery: string | null;
  events: TrackingEvent[];
  isTerminalAlert: boolean;
};

export const JOURNEY_STEPS: TrackingStep[] = [
  {
    id: "PENDING",
    label: "Order placed",
    shortLabel: "Placed",
    description: "We received your order and payment details.",
  },
  {
    id: "CONFIRMED",
    label: "Confirmed",
    shortLabel: "Confirmed",
    description: "Your order is confirmed and queued for packing.",
  },
  {
    id: "PROCESSING",
    label: "Preparing",
    shortLabel: "Preparing",
    description: "Our team is carefully packing your items.",
  },
  {
    id: "SHIPPED",
    label: "On the way",
    shortLabel: "Shipped",
    description: "Your parcel left our warehouse and is heading to you.",
  },
  {
    id: "DELIVERED",
    label: "Delivered",
    shortLabel: "Delivered",
    description: "Your order arrived safely. Enjoy!",
  },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
};

const JOURNEY_STATUS_IDS = new Set<string>(
  JOURNEY_STEPS.map((step) => step.id)
);

function formatWhen(date: Date) {
  return formatBdDateTime(date);
}

function formatDay(date: Date) {
  return formatBdDate(date, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Latest real timestamp recorded for each status (no fabricated times). */
function latestStatusTimes(events: TrackingStatusEvent[]) {
  const map = new Map<OrderStatus, Date>();
  for (const event of events) {
    const prev = map.get(event.status);
    if (!prev || event.at > prev) {
      map.set(event.status, event.at);
    }
  }
  return map;
}

export function buildTrackingTimeline(input: {
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  district: string;
  statusEvents?: TrackingStatusEvent[];
}): TrackingTimeline {
  const { status, createdAt, updatedAt, district } = input;
  const statusEvents =
    input.statusEvents && input.statusEvents.length > 0
      ? [...input.statusEvents].sort(
          (a, b) => a.at.getTime() - b.at.getTime()
        )
      : [{ status: "PENDING" as OrderStatus, at: createdAt }];

  const times = latestStatusTimes(statusEvents);
  if (!times.has("PENDING")) {
    times.set("PENDING", createdAt);
  }
  if (!times.has(status) && status !== "PENDING") {
    times.set(status, updatedAt);
  }

  if (status === "CANCELLED" || status === "REFUNDED") {
    const alertAt = times.get(status) ?? updatedAt;
    return {
      steps: JOURNEY_STEPS,
      currentStepIndex: -1,
      progress: 0,
      headline: status === "CANCELLED" ? "Order cancelled" : "Order refunded",
      subheadline:
        status === "CANCELLED"
          ? "This order was cancelled. Contact support if you need help."
          : "A refund has been processed for this order.",
      estimatedDelivery: null,
      isTerminalAlert: true,
      events: [
        {
          id: "placed",
          title: "Order placed",
          detail: "We received your order.",
          at: formatWhen(times.get("PENDING") ?? createdAt),
          tone: "done",
        },
        {
          id: "alert",
          title: status === "CANCELLED" ? "Order cancelled" : "Refund completed",
          detail:
            status === "CANCELLED"
              ? "No further delivery updates will appear for this order."
              : "Please allow a few days for the refund to reach your account.",
          at: formatWhen(alertAt),
          tone: "alert",
        },
      ],
    };
  }

  const currentStepIndex = STATUS_INDEX[status];
  const progress = ((currentStepIndex + 1) / JOURNEY_STEPS.length) * 100;

  const deliveredAt = times.get("DELIVERED");
  const estimatedDelivery =
    status === "DELIVERED" && deliveredAt
      ? `Delivered ${formatDay(deliveredAt)}`
      : status === "SHIPPED"
        ? `On the way to ${district}`
        : `Heading to ${district}`;

  const headlines: Record<
    TrackingStepId,
    { headline: string; subheadline: string }
  > = {
    PENDING: {
      headline: "Order received",
      subheadline: "We're reviewing your order and will confirm shortly.",
    },
    CONFIRMED: {
      headline: "Order confirmed",
      subheadline: "Great news — your order is locked in and ready to pack.",
    },
    PROCESSING: {
      headline: "Being prepared",
      subheadline: "Fresh picks and careful packing are underway.",
    },
    SHIPPED: {
      headline: "Out for delivery journey",
      subheadline: `Your parcel is on the way to ${district}.`,
    },
    DELIVERED: {
      headline: "Successfully delivered",
      subheadline: "Hope you love everything — thank you for shopping ROOTORA.",
    },
  };

  const current = JOURNEY_STEPS[currentStepIndex]!;
  const copy = headlines[current.id];

  const events: TrackingEvent[] = JOURNEY_STEPS.map((step, index) => {
    const isDone = index < currentStepIndex;
    const isActive = index === currentStepIndex;
    const tone: TrackingEvent["tone"] = isActive
      ? "active"
      : isDone
        ? "done"
        : "upcoming";

    const realAt = times.get(step.id as OrderStatus);
    const at =
      isDone || isActive
        ? realAt
          ? formatWhen(realAt)
          : "—"
        : "Upcoming";

    return {
      id: step.id,
      title: step.label,
      detail: step.description,
      at,
      tone,
    };
  }).filter(
    (event, index) => index <= currentStepIndex || index === currentStepIndex + 1
  );

  // Also surface any non-journey status events that happened (shouldn't normally)
  const extra = statusEvents
    .filter((event) => !JOURNEY_STATUS_IDS.has(event.status))
    .map((event) => ({
      id: event.status,
      title: event.status,
      detail: "Status updated by ROOTORA.",
      at: formatWhen(event.at),
      tone: "alert" as const,
    }));

  return {
    steps: JOURNEY_STEPS,
    currentStepIndex,
    progress,
    headline: copy.headline,
    subheadline: copy.subheadline,
    estimatedDelivery,
    events: [...events, ...extra],
    isTerminalAlert: false,
  };
}
