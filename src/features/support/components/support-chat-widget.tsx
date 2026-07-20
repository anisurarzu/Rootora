"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
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
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bootstrappedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(false);

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

  // Lock page scroll while chat is open (mobile keyboard friendly).
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [open]);

  // Keep panel height aligned with visual viewport when mobile keyboard opens.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const vv = window.visualViewport;
    const update = () => {
      const height = vv?.height ?? window.innerHeight;
      setViewportHeight(height);
    };

    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
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
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Could not start chat");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    if (open && visitorId && !bootstrappedRef.current) {
      void bootstrap();
    }
    if (!open) {
      bootstrappedRef.current = false;
      setAgentTyping(false);
      lastTypingSentRef.current = false;
    }
  }, [open, visitorId, bootstrap]);

  const realtimeJoin = useMemo(
    () =>
      open && visitorId ? { visitorId, role: "visitor" as const } : null,
    [open, visitorId]
  );

  useSupportRealtime(realtimeJoin, (event) => {
    if (event.visitorId !== visitorId) return;

    if (event.type === "message") {
      if (event.conversationId) setConversationId(event.conversationId);
      setStatus(event.status);
      setNeedsEmail(event.needsEmailForAgent);
      setMessages((prev) => mergeMessages(prev, event.messages));
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
      setAgentTyping(event.isTyping);
    }
  });

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
        "pointer-events-none z-[90]",
        open
          ? "fixed inset-0 md:inset-auto md:bottom-6 md:right-6"
          : "fixed bottom-4 right-4 md:bottom-6 md:right-6"
      )}
    >
      {open ? (
        <div
          className="pointer-events-auto flex w-full flex-col overflow-hidden bg-white md:h-[min(32rem,70vh)] md:w-[22rem] md:rounded-xl md:border md:border-border md:shadow-2xl"
          style={
            viewportHeight
              ? {
                  height: viewportHeight,
                  maxHeight: viewportHeight,
                }
              : { height: "100dvh" }
          }
        >
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

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain bg-muted/20 p-3">
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
        <Button
          type="button"
          size="lg"
          className="pointer-events-auto h-12 rounded-full px-4 shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Open support chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="ml-1.5 hidden sm:inline">Chat</span>
        </Button>
      ) : null}
    </div>
  );
}
