"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FlashSaleCountdownProps = {
  endsAt: string;
  className?: string;
};

function getRemaining(endsAt: string) {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, expired: diff <= 0 };
}

export function FlashSaleCountdown({
  endsAt,
  className,
}: FlashSaleCountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    setRemaining(getRemaining(endsAt));
    const timer = window.setInterval(() => {
      setRemaining(getRemaining(endsAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (remaining.expired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={cn(
        "flex items-center gap-1 font-button text-[10px] font-semibold tabular-nums text-orange-700",
        className
      )}
      aria-live="polite"
    >
      <span className="rounded bg-orange-100 px-1.5 py-0.5">
        {pad(remaining.hours)}
      </span>
      <span>:</span>
      <span className="rounded bg-orange-100 px-1.5 py-0.5">
        {pad(remaining.minutes)}
      </span>
      <span>:</span>
      <span className="rounded bg-orange-100 px-1.5 py-0.5">
        {pad(remaining.seconds)}
      </span>
    </div>
  );
}
