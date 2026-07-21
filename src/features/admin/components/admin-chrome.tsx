"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import { toast } from "sonner";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { useSupportRealtime } from "@/features/support/use-support-realtime";

type ConversationSnap = {
  id: string;
  guestEmail: string | null;
  guestName: string | null;
  status: string;
  lastMessageAt: string;
  preview: string;
  lastSender: string | null;
};

type SupportAlertsContextValue = {
  attentionCount: number;
};

const SupportAlertsContext = createContext<SupportAlertsContextValue>({
  attentionCount: 0,
});

export function useSupportAlerts() {
  return useContext(SupportAlertsContext);
}

function notifyBrowser(title: string, body: string, href: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
  if (Notification.permission !== "granted") return;
  try {
    const note = new Notification(title, {
      body,
      tag: `support-${href}`,
    });
    note.onclick = () => {
      window.focus();
      window.location.href = href;
      note.close();
    };
  } catch {
    // ignore
  }
}

function useAdminSupportPolling(viewingConversationId: string | null) {
  const pathname = usePathname();
  const [attentionCount, setAttentionCount] = useState(0);
  const snapshotRef = useRef<Map<string, string>>(new Map());
  const primedRef = useRef(false);
  const viewingIdRef = useRef(viewingConversationId);

  useEffect(() => {
    viewingIdRef.current = viewingConversationId;
  }, [viewingConversationId]);

  const alertForConversation = useCallback((c: ConversationSnap) => {
    const needsAttention =
      c.status === "WAITING_AGENT" ||
      (c.status === "ACTIVE" && c.lastSender === "VISITOR");
    if (!needsAttention) return;
    if (viewingIdRef.current === c.id) return;

    const name = c.guestName || c.guestEmail || "Visitor";
    const preview = c.preview.slice(0, 80) || "New support message";
    const href = `/admin/support?id=${encodeURIComponent(c.id)}`;

    toast.message(`Support · ${name}`, {
      description: preview,
      action: {
        label: "Open",
        onClick: () => {
          window.location.href = href;
        },
      },
      duration: 8000,
    });
    notifyBrowser(`Support · ${name}`, preview, href);
  }, []);

  const applySnapshot = useCallback(
    (conversations: ConversationSnap[], attention: number) => {
      setAttentionCount(attention);

      const nextMap = new Map<string, string>();
      for (const c of conversations) {
        nextMap.set(c.id, c.lastMessageAt);
        if (primedRef.current) {
          const prev = snapshotRef.current.get(c.id);
          if (
            (!prev || prev < c.lastMessageAt) &&
            (c.lastSender === "VISITOR" || c.status === "WAITING_AGENT")
          ) {
            alertForConversation(c);
          }
        }
      }
      snapshotRef.current = nextMap;
      primedRef.current = true;
    },
    [alertForConversation],
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/support/admin");
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success || !json.data) return;
      applySnapshot(
        json.data.conversations as ConversationSnap[],
        Number(json.data.attentionCount ?? 0),
      );
    } catch {
      // ignore
    }
  }, [applySnapshot]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  useSupportRealtime({ role: "admin" }, (event) => {
    if (event.type !== "message") return;
    const last = event.messages[event.messages.length - 1];
    if (!last || last.sender !== "VISITOR") return;
    void refresh();
  });

  useEffect(() => {
    if (pathname.startsWith("/admin/support")) {
      void refresh();
    }
  }, [pathname, viewingConversationId, refresh]);

  return attentionCount;
}

function AdminChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewingId =
    pathname.startsWith("/admin/support") ? searchParams.get("id") : null;
  const attentionCount = useAdminSupportPolling(viewingId);

  return (
    <SupportAlertsContext.Provider value={{ attentionCount }}>
      <div className="flex min-h-screen bg-background">
        <aside className="hidden w-52 shrink-0 bg-primary md:flex md:flex-col">
          <div className="border-b border-white/15 px-4 py-4">
            <Link href="/admin" className="block">
              <span className="font-heading text-lg font-semibold text-white">
                ROOTORA
              </span>
              <span className="mt-0.5 block font-button text-xs font-medium uppercase tracking-wider text-white/70">
                Admin
              </span>
            </Link>
            <Link
              href="/"
              className="mt-3 inline-flex font-button text-sm text-white/80 transition-colors hover:text-white"
            >
              ← Back to store
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <AdminNav
              variant="sidebar"
              supportAttentionCount={attentionCount}
            />
          </div>
          <div className="border-t border-white/15 p-3">
            <Link
              href="/"
              className="font-button text-sm text-white/75 transition-colors hover:text-white"
            >
              ← Back to store
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border bg-white px-6 py-4 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/admin"
                className="font-heading text-lg font-semibold text-primary"
              >
                ROOTORA Admin
              </Link>
              <Link
                href="/"
                className="shrink-0 font-button text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                ← Store
              </Link>
            </div>
            <div className="mt-4">
              <AdminNav
                variant="light"
                supportAttentionCount={attentionCount}
              />
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SupportAlertsContext.Provider>
  );
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-background">
          <aside className="hidden w-52 shrink-0 bg-primary md:block" />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      }
    >
      <AdminChromeInner>{children}</AdminChromeInner>
    </Suspense>
  );
}
