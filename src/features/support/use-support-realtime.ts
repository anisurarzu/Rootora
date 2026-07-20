"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { SupportRealtimeEvent } from "@/features/support/types";
import { SUPPORT_SOCKET_PATH } from "@/features/support/types";

type JoinPayload = {
  visitorId?: string;
  conversationId?: string;
  role?: "visitor" | "admin";
};

type Mode = "socket" | "poll" | "idle";

/**
 * Prefer Socket.IO when available (custom Node server).
 * On Vercel / serverless, automatically falls back to HTTP polling so chat
 * stays fully workable in production without a persistent WebSocket host.
 */
export function useSupportRealtime(
  join: JoinPayload | null,
  onEvent: (event: SupportRealtimeEvent) => void
) {
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const lastSinceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!join) {
      setConnected(false);
      setMode("idle");
      return;
    }

    let cancelled = false;
    let socket: Socket | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let socketTimeout: ReturnType<typeof setTimeout> | null = null;
    let usingPoll = false;

    const emitLocal = (event: SupportRealtimeEvent) => {
      onEventRef.current(event);
    };

    const stopPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const startPoll = () => {
      if (cancelled || usingPoll || !join.visitorId) return;
      usingPoll = true;
      setMode("poll");
      setConnected(true);

      const tick = async () => {
        if (cancelled || !join.visitorId) return;
        try {
          const since = lastSinceRef.current
            ? `&since=${encodeURIComponent(lastSinceRef.current)}`
            : "";
          const res = await fetch(
            `/api/v1/support/messages?visitorId=${encodeURIComponent(join.visitorId)}${since}`
          );
          const json = await res.json();
          if (!json.success || cancelled) return;

          if (json.data.conversation) {
            emitLocal({
              type: "conversation:update",
              conversationId: json.data.conversation.id,
              visitorId: join.visitorId,
              status: json.data.conversation.status,
              guestEmail: json.data.conversation.guestEmail,
              guestName: json.data.conversation.guestName,
            });
          }

          const messages = json.data.messages ?? [];
          if (messages.length > 0) {
            lastSinceRef.current =
              messages[messages.length - 1]?.createdAt ?? lastSinceRef.current;
            emitLocal({
              type: "message",
              conversationId:
                json.data.conversation?.id ?? join.conversationId ?? "",
              visitorId: join.visitorId,
              status: json.data.conversation?.status ?? "BOT",
              needsEmailForAgent:
                json.data.conversation?.needsEmailForAgent ?? true,
              messages,
            });
          }
        } catch {
          // keep polling
        }
      };

      void tick();
      pollTimer = setInterval(tick, 2000);
    };

    // Admin: soft refresh via conversation poll endpoint
    const startAdminPoll = () => {
      if (cancelled || usingPoll) return;
      usingPoll = true;
      setMode("poll");
      setConnected(true);

      const tick = async () => {
        if (cancelled || !join.conversationId) return;
        try {
          const res = await fetch(
            `/api/v1/support/admin/${encodeURIComponent(join.conversationId)}`
          );
          if (!res.ok) return;
          const json = await res.json();
          if (!json.success || !json.data || cancelled) return;

          emitLocal({
            type: "message",
            conversationId: json.data.id,
            visitorId: json.data.visitorId,
            status: json.data.status,
            needsEmailForAgent: !json.data.guestEmail,
            messages: json.data.messages,
          });
        } catch {
          // keep polling
        }
      };

      void tick();
      pollTimer = setInterval(tick, 2500);
    };

    const enableFallback = () => {
      if (cancelled || usingPoll) return;
      if (join.role === "admin") startAdminPoll();
      else if (join.visitorId) startPoll();
    };

    try {
      socket = io({
        path: SUPPORT_SOCKET_PATH,
        transports: ["websocket", "polling"],
        autoConnect: true,
        timeout: 2500,
        reconnectionAttempts: 2,
        reconnectionDelay: 800,
      });

      socket.on("connect", () => {
        if (cancelled) return;
        stopPoll();
        usingPoll = false;
        setMode("socket");
        setConnected(true);
        socket?.emit("support:join", join);
      });

      socket.on("disconnect", () => {
        if (cancelled) return;
        setConnected(false);
        enableFallback();
      });

      socket.on("connect_error", () => {
        if (cancelled) return;
        enableFallback();
      });

      socket.on("support:event", (event: SupportRealtimeEvent) => {
        if (event.type === "message" && event.messages.length) {
          lastSinceRef.current =
            event.messages[event.messages.length - 1]?.createdAt ??
            lastSinceRef.current;
        }
        emitLocal(event);
      });

      // If Socket.IO is unavailable (Vercel), fall back quickly.
      socketTimeout = setTimeout(() => {
        if (!cancelled && !socket?.connected) {
          enableFallback();
        }
      }, 1800);
    } catch {
      enableFallback();
    }

    return () => {
      cancelled = true;
      if (socketTimeout) clearTimeout(socketTimeout);
      stopPoll();
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [join?.visitorId, join?.conversationId, join?.role]);

  return { connected, mode };
}
