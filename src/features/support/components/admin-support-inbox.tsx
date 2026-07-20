"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import {
  closeSupportConversation,
  deleteSupportChat,
  replyToSupportChat,
} from "@/features/support/actions";
import { TypingDots } from "@/features/support/components/typing-dots";
import type { SupportChatMessage } from "@/features/support/types";
import {
  publishTyping,
  useSupportRealtime,
} from "@/features/support/use-support-realtime";
import { cn } from "@/lib/utils";

function formatChatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-BD", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

type ConversationListItem = {
  id: string;
  guestEmail: string | null;
  guestName: string | null;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  messageCount: number;
  preview: string;
  assignedAgent: { id: string; name: string } | null;
};

type ChatMessage = SupportChatMessage;

type ConversationDetail = {
  id: string;
  visitorId?: string;
  guestEmail: string | null;
  guestName: string | null;
  status: string;
  messages: ChatMessage[];
  assignedAgent: { id: string; name: string; email: string } | null;
};

type AdminSupportInboxProps = {
  conversations: ConversationListItem[];
  initialConversation: ConversationDetail | null;
};

export function AdminSupportInbox({
  conversations: initialConversations,
  initialConversation,
}: AdminSupportInboxProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversation?.id ?? "");
  const [detail, setDetail] = useState(initialConversation);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(false);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Sync list only when server props change from navigation (not after every reply).
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length, visitorTyping]);

  const loadConversation = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setVisitorTyping(false);
    lastTypingSentRef.current = false;
    try {
      const res = await fetch(`/api/v1/support/admin/${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Could not load conversation");
      }
      setSelectedId(id);
      setDetail(json.data);
      window.history.replaceState(null, "", `/admin/support?id=${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load chat");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useSupportRealtime(
    selectedId
      ? { role: "admin", conversationId: selectedId }
      : { role: "admin" },
    (event) => {
      if (event.type === "message") {
        const activeId = selectedIdRef.current;

        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === event.conversationId);
          if (idx < 0) return prev;
          const next = [...prev];
          const last = event.messages[event.messages.length - 1];
          next[idx] = {
            ...next[idx],
            status: event.status,
            lastMessageAt: last?.createdAt ?? next[idx].lastMessageAt,
            preview: last?.body ?? next[idx].preview,
            messageCount: next[idx].messageCount + event.messages.length,
          };
          // Move updated chat to top
          const [item] = next.splice(idx, 1);
          return [item, ...next];
        });

        if (event.conversationId === activeId) {
          setVisitorTyping(false);
          setDetail((prev) => {
            if (!prev || prev.id !== event.conversationId) return prev;

            const ids = new Set(prev.messages.map((m) => m.id));
            const nextMessages = [...prev.messages];
            for (const msg of event.messages) {
              if (!ids.has(msg.id)) nextMessages.push(msg);
            }
            return {
              ...prev,
              status: event.status,
              messages: nextMessages,
              visitorId: event.visitorId,
            };
          });
        }
      }

      if (event.type === "conversation:update") {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === event.conversationId
              ? { ...c, status: event.status }
              : c
          )
        );
        setDetail((prev) =>
          prev && prev.id === event.conversationId
            ? { ...prev, status: event.status }
            : prev
        );
      }

      if (
        event.type === "typing" &&
        event.conversationId === selectedIdRef.current &&
        event.role === "visitor"
      ) {
        setVisitorTyping(event.isTyping);
      }
    }
  );

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedId) return;
      if (lastTypingSentRef.current === isTyping) return;
      lastTypingSentRef.current = isTyping;
      void publishTyping({
        conversationId: selectedId,
        role: "agent",
        isTyping,
      });
    },
    [selectedId]
  );

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (!selectedId) return;

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

  const sendReply = () => {
    if (!selectedId || !draft.trim()) return;
    const body = draft.trim();
    notifyTyping(false);
    startTransition(async () => {
      const result = await replyToSupportChat(selectedId, body);
      if (!result.success || !result.data) {
        toast.error(result.success ? "Could not send reply" : result.error);
        return;
      }

      setDraft("");
      const msg = result.data.message;

      setDetail((prev) => {
        if (!prev || prev.id !== selectedId) return prev;
        if (prev.messages.some((m) => m.id === msg.id)) {
          return { ...prev, status: result.data!.status };
        }
        return {
          ...prev,
          status: result.data!.status,
          messages: [...prev.messages, msg],
        };
      });

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === selectedId);
        if (idx < 0) return prev;
        const next = [...prev];
        const updated = {
          ...next[idx],
          status: result.data!.status,
          lastMessageAt: msg.createdAt,
          preview: msg.body,
          messageCount: next[idx].messageCount + 1,
        };
        next.splice(idx, 1);
        return [updated, ...next];
      });

      toast.success("Reply sent");
    });
  };

  const closeChat = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await closeSupportConversation(selectedId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((prev) =>
        prev && prev.id === selectedId ? { ...prev, status: "CLOSED" } : prev
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, status: "CLOSED" } : c
        )
      );
      toast.success("Conversation closed");
    });
  };

  const deleteChat = () => {
    if (!selectedId) return;

    startTransition(async () => {
      const result = await deleteSupportChat(selectedId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Conversation deleted");
      setConfirmDeleteOpen(false);
      setConversations((prev) => prev.filter((c) => c.id !== selectedId));
      setDetail(null);
      setSelectedId("");
      window.history.replaceState(null, "", "/admin/support");
    });
  };

  return (
    <div className="grid min-h-[70vh] overflow-hidden rounded-xl border border-border bg-white lg:grid-cols-[20rem_1fr]">
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-button text-sm font-semibold text-heading">
            Conversations
          </h2>
          <p className="text-xs text-muted-foreground">
            Email-claimed chats only
          </p>
        </div>
        <ul className="max-h-[40vh] overflow-y-auto lg:max-h-[calc(70vh-3.5rem)]">
          {conversations.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No support chats yet
            </li>
          ) : (
            conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => void loadConversation(c.id)}
                  className={cn(
                    "block w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    selectedId === c.id && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-heading">
                      {c.guestName || c.guestEmail || "Guest"}
                    </p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.guestEmail}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {c.preview}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <section className="flex min-h-[28rem] flex-col">
        {loadingDetail ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Loading conversation…
          </div>
        ) : !detail ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Select a conversation to reply
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p className="font-heading text-lg font-semibold text-heading">
                  {detail.guestName || "Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {detail.guestEmail}
                </p>
                {detail.assignedAgent ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Assigned: {detail.assignedAgent.name}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <StatusPill status={detail.status} />
                {detail.status !== "CLOSED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={closeChat}
                  >
                    Close
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
              {detail.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    msg.sender === "AGENT"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : msg.sender === "VISITOR"
                        ? "bg-white ring-1 ring-border"
                        : "bg-amber-50 text-heading ring-1 ring-amber-100"
                  )}
                >
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {msg.sender === "AGENT"
                      ? "You"
                      : msg.sender === "VISITOR"
                        ? "Customer"
                        : "Bot"}
                    {" · "}
                    {formatChatTime(msg.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
              ))}
              {visitorTyping ? (
                <TypingDots label="Customer is typing" />
              ) : null}
              <div ref={bottomRef} />
            </div>

            {detail.status !== "CLOSED" ? (
              <div className="border-t border-border p-3">
                <Textarea
                  rows={3}
                  value={draft}
                  placeholder="Write a reply…"
                  onChange={(e) => onDraftChange(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    disabled={pending || !draft.trim()}
                    onClick={sendReply}
                  >
                    {pending ? "Sending…" : "Send reply"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                This conversation is closed.
              </p>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete conversation?"
        description="This permanently deletes the chat and all messages. This cannot be undone."
        confirmLabel="Delete conversation"
        tone="danger"
        loading={pending}
        onConfirm={deleteChat}
      />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    WAITING_AGENT: "bg-orange-100 text-orange-800",
    ACTIVE: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-muted text-muted-foreground",
    BOT: "bg-sky-100 text-sky-800",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
