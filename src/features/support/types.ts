export type SupportChatMessage = {
  id: string;
  sender: "VISITOR" | "BOT" | "AGENT";
  body: string;
  createdAt: string;
  agentUserId?: string | null;
};

export type SupportRealtimeEvent =
  | {
      type: "message";
      conversationId: string;
      visitorId: string;
      status: string;
      needsEmailForAgent: boolean;
      messages: SupportChatMessage[];
    }
  | {
      type: "conversation:update";
      conversationId: string;
      visitorId: string;
      status: string;
      guestEmail?: string | null;
      guestName?: string | null;
    }
  | {
      type: "typing";
      conversationId: string;
      visitorId: string;
      role: "visitor" | "agent";
      isTyping: boolean;
    };

export const SUPPORT_SOCKET_PATH = "/api/support/socket";
