"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  conversations,
  initialConversation,
}: AdminSupportInboxProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialConversation?.id ?? "");
  const [detail, setDetail] = useState(initialConversation);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(false);

  useEffect(() => {
    setDetail(initialConversation);
    setSelectedId(initialConversation?.id ?? "");
    setVisitorTyping(false);
    lastTypingSentRef.current = false;
  }, [initialConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length, visitorTyping]);

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, 5000);
    return () => window.clearInterval(id);
  }, [router]);

  useSupportRealtime(
    selectedId
      ? { role: "admin", conversationId: selectedId }
      : { role: "admin" },
    (event) => {
      if (event.type === "message" && event.conversationId === selectedId) {
        setVisitorTyping(false);
        setDetail((prev) => {
          if (!prev || prev.id !== event.conversationId) return prev;

          const incomingIds = new Set(event.messages.map((m) => m.id));
          const isFullSnapshot =
            event.messages.length > 0 &&
            prev.messages.every((m) => incomingIds.has(m.id)) &&
            event.messages.length >= prev.messages.length;

          if (isFullSnapshot) {
            return {
              ...prev,
              status: event.status,
              messages: event.messages,
              visitorId: event.visitorId,
            };
          }

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

      if (event.type === "conversation:update") {
        router.refresh();
      }

      if (
        event.type === "typing" &&
        event.conversationId === selectedId &&
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
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDraft("");
      toast.success("Reply sent");
      router.refresh();
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
      toast.success("Conversation closed");
      router.refresh();
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
      setDetail(null);
      setSelectedId("");
      router.push("/admin/support");
      router.refresh();
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
                <Link
                  href={`/admin/support?id=${c.id}`}
                  className={cn(
                    "block border-b border-border/60 px-4 py-3 transition-colors hover:bg-muted/40",
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
                </Link>
              </li>
            ))
          )}
        </ul>
      </aside>

      <section className="flex min-h-[28rem] flex-col">
        {!detail ? (
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
