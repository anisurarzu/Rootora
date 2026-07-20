"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Headset, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypingDots } from "@/features/support/components/typing-dots";
import type { SupportChatMessage } from "@/features/support/types";
import {
  publishTyping,
  useSupportRealtime,
} from "@/features/support/use-support-realtime";
import { cn } from "@/lib/utils";

const VISITOR_KEY = "rootora_support_visitor_id";

function getVisitorId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function readKey(visitorId: string) {
  return `rootora_support_last_read_${visitorId}`;
}

function getLastReadAt(visitorId: string) {
  if (typeof window === "undefined" || !visitorId) return "";
  const key = readKey(visitorId);
  let value = localStorage.getItem(key);
  if (!value) {
    value = new Date().toISOString();
    localStorage.setItem(key, value);
  }
  return value;
}

function setLastReadAt(visitorId: string, iso: string) {
  if (typeof window === "undefined" || !visitorId) return;
  localStorage.setItem(readKey(visitorId), iso);
}

function countUnread(
  messages: SupportChatMessage[],
  lastReadAt: string
): number {
  return messages.filter(
    (m) =>
      m.sender === "AGENT" &&
      (!lastReadAt || m.createdAt > lastReadAt)
  ).length;
}

function latestMessageAt(messages: SupportChatMessage[]) {
  return messages.reduce((latest, msg) => {
    return msg.createdAt > latest ? msg.createdAt : latest;
  }, "");
}

function mergeMessages(
  current: SupportChatMessage[],
  incoming: SupportChatMessage[]
) {
  const ids = new Set(current.map((m) => m.id));
  const next = [...current];
  for (const msg of incoming) {
    if (!ids.has(msg.id)) next.push(msg);
  }
  return next;
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [status, setStatus] = useState<string>("BOT");
  const [needsEmail, setNeedsEmail] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileShellStyle, setMobileShellStyle] = useState<CSSProperties | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const bootstrappedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(false);
  const openRef = useRef(false);
  const lastReadRef = useRef("");
  const bodyScrollYRef = useRef(0);

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!visitorId) return;
    lastReadRef.current = getLastReadAt(visitorId);
  }, [visitorId]);

  const markAsRead = useCallback(
    (msgs: SupportChatMessage[]) => {
      if (!visitorId) return;
      const stamp = latestMessageAt(msgs) || new Date().toISOString();
      lastReadRef.current = stamp;
      setLastReadAt(visitorId, stamp);
      setUnreadCount(0);
    },
    [visitorId]
  );

  const refreshUnread = useCallback(
    (msgs: SupportChatMessage[]) => {
      if (openRef.current) {
        markAsRead(msgs);
        return;
      }
      setUnreadCount(countUnread(msgs, lastReadRef.current));
    },
    [markAsRead]
  );

  // Freeze page scroll while chat is open (prevents iOS keyboard "jump").
  useEffect(() => {
    if (!open) return;

    bodyScrollYRef.current = window.scrollY;
    const { body, documentElement } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      touchAction: body.style.touchAction,
      htmlOverflow: documentElement.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${bodyScrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      body.style.touchAction = prev.touchAction;
      documentElement.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, bodyScrollYRef.current);
    };
  }, [open]);

  // Pin chat shell to the visual viewport so the keyboard does not blow the layout.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

    const update = () => {
      if (isDesktop()) {
        setMobileShellStyle(null);
        return;
      }

      const vv = window.visualViewport;
      const top = vv?.offsetTop ?? 0;
      const height = vv?.height ?? window.innerHeight;

      setMobileShellStyle({
        position: "fixed",
        top: `${top}px`,
        left: "0px",
        right: "0px",
        bottom: "auto",
        width: "100%",
        height: `${height}px`,
        maxHeight: `${height}px`,
      });
    };

    update();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      setMobileShellStyle(null);
    };
  }, [open]);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    // Avoid scrollIntoView — it scrolls the page and breaks iOS keyboard layout.
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(scrollToBottom);
    return () => window.cancelAnimationFrame(id);
  }, [messages, open, agentTyping, scrollToBottom]);

  const bootstrap = useCallback(async (opts?: { silent?: boolean }) => {
    if (!visitorId) return;
    const silent = Boolean(opts?.silent);
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(
        `/api/v1/support/conversations?visitorId=${encodeURIComponent(visitorId)}`
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not start chat");
      setConversationId(json.data.id);
      setMessages(json.data.messages);
      setStatus(json.data.status);
      setNeedsEmail(json.data.needsEmailForAgent);
      bootstrappedRef.current = true;
      if (openRef.current) {
        markAsRead(json.data.messages);
      } else {
        refreshUnread(json.data.messages);
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Could not start chat");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [visitorId, markAsRead, refreshUnread]);

  useEffect(() => {
    if (open && visitorId) {
      if (!bootstrappedRef.current) {
        void bootstrap();
      } else {
        markAsRead(messages);
      }
    }
    if (!open) {
      setAgentTyping(false);
      lastTypingSentRef.current = false;
      refreshUnread(messages);
    }
  }, [open, visitorId, bootstrap, markAsRead, refreshUnread, messages]);

  // Keep listening in background so the unread badge updates when chat is closed.
  const realtimeJoin = useMemo(
    () => (visitorId ? { visitorId, role: "visitor" as const } : null),
    [visitorId]
  );

  useSupportRealtime(realtimeJoin, (event) => {
    if (event.visitorId !== visitorId) return;

    if (event.type === "message") {
      if (event.conversationId) setConversationId(event.conversationId);
      setStatus(event.status);
      setNeedsEmail(event.needsEmailForAgent);
      setMessages((prev) => {
        const next = mergeMessages(prev, event.messages);
        if (openRef.current) {
          markAsRead(next);
        } else {
          refreshUnread(next);
        }
        return next;
      });
      setAgentTyping(false);
      return;
    }

    if (event.type === "conversation:update") {
      if (event.conversationId) setConversationId(event.conversationId);
      setStatus(event.status);
      setNeedsEmail(!event.guestEmail);
      return;
    }

    if (event.type === "typing" && event.role === "agent") {
      if (openRef.current) setAgentTyping(event.isTyping);
    }
  });

  // Soft load once so unread count is ready before the user opens chat.
  useEffect(() => {
    if (!visitorId || bootstrappedRef.current) return;
    void bootstrap({ silent: true });
  }, [visitorId, bootstrap]);

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId || !visitorId) return;
      if (lastTypingSentRef.current === isTyping) return;
      lastTypingSentRef.current = isTyping;
      void publishTyping({
        conversationId,
        visitorId,
        role: "visitor",
        isTyping,
      });
    },
    [conversationId, visitorId]
  );

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (!conversationId) return;

    if (value.trim()) {
      notifyTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        notifyTyping(false);
      }, 1200);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      notifyTyping(false);
    }
  };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !visitorId || sending) return;

    setSending(true);
    setError(null);
    setDraft("");
    notifyTyping(false);
    try {
      const res = await fetch("/api/v1/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, body }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to send");

      setConversationId(json.data.conversationId);
      setMessages((prev) => mergeMessages(prev, json.data.messages));
      setStatus(json.data.status);
      setNeedsEmail(json.data.needsEmailForAgent);

      if (
        json.data.needsEmailForAgent &&
        /\b(human|agent|support|help me|talk to)\b/i.test(body)
      ) {
        setShowEmailForm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  const submitEmail = async () => {
    if (!visitorId || !email.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/support/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not save email");

      setNeedsEmail(false);
      setShowEmailForm(false);
      setStatus(json.data.status);
      await bootstrap({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save email");
    } finally {
      setSending(false);
    }
  };

  const showConnecting = loading && messages.length === 0;

  return (
    <div
      className={cn(
        "pointer-events-none z-[90] overflow-visible",
        open
          ? "fixed inset-0 md:inset-auto md:bottom-6 md:right-6"
          : "fixed bottom-5 right-3 md:bottom-6 md:right-4"
      )}
      style={open ? (mobileShellStyle ?? undefined) : undefined}
    >
      {open ? (
        <div className="pointer-events-auto flex h-full w-full flex-col overflow-hidden bg-white md:h-[min(32rem,70vh)] md:w-[22rem] md:rounded-xl md:border md:border-border md:shadow-2xl">
          <div className="flex shrink-0 items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="font-button text-sm font-semibold">ROOTORA Support</p>
              <p className="text-[11px] text-primary-foreground/80">
                {status === "BOT"
                  ? "Auto assistant online"
                  : status === "WAITING_AGENT"
                    ? "Waiting for an agent…"
                    : status === "ACTIVE"
                      ? "Agent connected"
                      : "Chat"}
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={messagesRef}
            className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain bg-muted/20 p-3"
          >
            {showConnecting ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Connecting…
              </p>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                      msg.sender === "VISITOR"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : msg.sender === "AGENT"
                          ? "bg-emerald-50 text-heading ring-1 ring-emerald-100"
                          : "bg-white text-heading shadow-sm ring-1 ring-border/60"
                    )}
                  >
                    {msg.sender !== "VISITOR" ? (
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {msg.sender === "AGENT" ? "Support" : "Assistant"}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                  </div>
                ))}
                {agentTyping ? <TypingDots label="Support is typing" /> : null}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {needsEmail && showEmailForm ? (
            <div className="shrink-0 space-y-2 border-t border-border bg-amber-50/80 p-3">
              <p className="text-xs font-medium text-heading">
                Share your email to talk with our support team
              </p>
              <Input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 bg-white"
              />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 bg-white"
                required
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  disabled={sending || !email.trim()}
                  onClick={() => void submitEmail()}
                >
                  Continue with email
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEmailForm(false)}
                >
                  Later
                </Button>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="shrink-0 border-t border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <div className="shrink-0 border-t border-border bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {needsEmail && !showEmailForm ? (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="mb-2 w-full rounded-md bg-muted px-2 py-1.5 text-left text-[11px] text-muted-foreground hover:bg-muted/80"
              >
                Talk to a human? Tap here to share your email →
              </button>
            ) : null}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <Input
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                placeholder="Type a message…"
                className="h-10"
                disabled={sending}
                maxLength={2000}
                enterKeyHint="send"
                autoComplete="off"
                onFocus={() => {
                  window.setTimeout(scrollToBottom, 50);
                  window.setTimeout(scrollToBottom, 300);
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={sending || !draft.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={
            unreadCount > 0
              ? `Open support chat, ${unreadCount} unread`
              : "Open support chat"
          }
          className="pointer-events-auto group relative overflow-visible rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-visible">
            <span
              aria-hidden
              className={cn(
                "support-fab-ring absolute inset-0 rounded-full border border-primary/35",
                unreadCount > 0 && "border-red-400/50"
              )}
            />
            <span
              aria-hidden
              className={cn(
                "support-fab-ring-delay absolute inset-0 rounded-full border border-primary/25",
                unreadCount > 0 && "border-red-400/40"
              )}
            />
            <span
              className={cn(
                "relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground shadow-lift transition duration-300",
                "bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_88%,white),var(--primary)_55%,color-mix(in_oklab,var(--primary)_82%,black))]",
                "group-hover:scale-[1.04] group-hover:shadow-[0_16px_40px_-10px_rgb(53_94_59_/_0.45)]",
                "group-active:scale-[0.98]",
                unreadCount > 0 && "ring-2 ring-red-400 ring-offset-2 ring-offset-background"
              )}
            >
              <span className="support-fab-float relative flex items-center justify-center">
                <Headset className="h-6 w-6" strokeWidth={1.75} />
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-1.5 flex h-4 w-[1.15rem] items-center justify-center gap-[2px] rounded-full bg-white px-[3px] shadow-sm"
                >
                  <span className="support-fab-dot h-[3px] w-[3px] rounded-full bg-primary [animation-delay:0ms]" />
                  <span className="support-fab-dot h-[3px] w-[3px] rounded-full bg-primary [animation-delay:160ms]" />
                  <span className="support-fab-dot h-[3px] w-[3px] rounded-full bg-primary [animation-delay:320ms]" />
                </span>
              </span>
              <span
                aria-hidden
                className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_2px_var(--primary)]"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/80" />
              </span>
            </span>

            {unreadCount > 0 ? (
              <span
                className="absolute right-0 top-0 z-20 flex h-5 min-w-5 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white"
                aria-hidden
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </span>
        </button>
      ) : null}
    </div>
  );
}
