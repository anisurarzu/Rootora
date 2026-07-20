"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const { trialNotice } = siteConfig;

  if (!visible || !trialNotice.enabled) return null;

  return (
    <div
      role="banner"
      className="relative w-full max-w-[100vw] overflow-hidden border-b border-primary/10 bg-primary/[0.06] text-foreground backdrop-blur-sm dark:bg-primary/10"
    >
      <div className="container-rootora relative flex items-center justify-center gap-2 py-1.5 pr-9 text-center sm:gap-2.5 sm:py-2 sm:pr-12">
        <Info
          className="hidden h-3.5 w-3.5 shrink-0 text-primary/80 sm:block"
          aria-hidden
        />
        <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
          <span className="font-medium text-foreground">Trial mode</span>
          {" — "}
          ROOTORA is currently in preview. Official launch from{" "}
          <span className="font-medium text-primary">
            {trialNotice.launchLabel}
          </span>
          .
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:right-4"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
