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
      className="relative bg-primary text-primary-foreground"
    >
      <div className="container-rootora flex items-center justify-center py-2.5 text-center text-sm">
        <p className="font-button font-medium">
          Free delivery on orders over ৳2,000 —{" "}
          <Link
            href="/shop"
            className="underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            Shop Now
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-md p-1 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
