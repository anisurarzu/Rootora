"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="banner"
      className="relative w-full max-w-[100vw] overflow-hidden bg-primary text-primary-foreground"
    >
      <div className="container-rootora relative flex items-center justify-center gap-2 py-2 pr-10 text-center sm:py-2.5 sm:pr-12">
        <p className="font-button text-[11px] font-medium leading-snug sm:text-sm">
          Free delivery over ৳2,000 —{" "}
          <Link
            href="/shop"
            className="underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            Shop now
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50 sm:right-4"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
