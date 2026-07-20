type TypingRole = "visitor" | "agent";

type TypingEntry = {
  visitorUntil?: number;
  agentUntil?: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __ROOTORA_SUPPORT_TYPING__: Map<string, TypingEntry> | undefined;
}

function store() {
  if (!globalThis.__ROOTORA_SUPPORT_TYPING__) {
    globalThis.__ROOTORA_SUPPORT_TYPING__ = new Map();
  }
  return globalThis.__ROOTORA_SUPPORT_TYPING__;
}

const TYPING_TTL_MS = 3500;

export function setTypingState(input: {
  conversationId: string;
  role: TypingRole;
  isTyping: boolean;
}) {
  const map = store();
  const current = map.get(input.conversationId) ?? {};
  const until = input.isTyping ? Date.now() + TYPING_TTL_MS : 0;

  if (input.role === "visitor") {
    current.visitorUntil = until || undefined;
  } else {
    current.agentUntil = until || undefined;
  }

  map.set(input.conversationId, current);
  return getTypingState(input.conversationId);
}

export function getTypingState(conversationId: string) {
  const entry = store().get(conversationId);
  const now = Date.now();
  return {
    visitorTyping: Boolean(entry?.visitorUntil && entry.visitorUntil > now),
    agentTyping: Boolean(entry?.agentUntil && entry.agentUntil > now),
  };
}
