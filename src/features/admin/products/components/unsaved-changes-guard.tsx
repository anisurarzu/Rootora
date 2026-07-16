"use client";

import { useEffect } from "react";

type UnsavedChangesGuardProps = {
  when: boolean;
};

export function UnsavedChangesGuard({ when }: UnsavedChangesGuardProps) {
  useEffect(() => {
    if (!when) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  return null;
}
