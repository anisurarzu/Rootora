import { z } from "zod";
import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { getTypingState, setTypingState } from "@/features/support/typing-store";
import { publishSupportRealtime } from "@/features/support/realtime";
import { prisma } from "@/lib/prisma";
import { visitorIdSchema } from "@/features/support/service";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const conversationId = new URL(request.url).searchParams.get(
      "conversationId"
    );
    if (!conversationId) {
      return apiError("conversationId is required", { status: 400 });
    }
    return apiOk({
      conversationId,
      ...getTypingState(conversationId),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const postSchema = z.object({
  conversationId: z.string().min(1),
  role: z.enum(["visitor", "agent"]),
  isTyping: z.boolean(),
  visitorId: visitorIdSchema.optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return apiError("Invalid typing payload", { status: 400 });
    }

    const conversation = await prisma.supportConversation.findUnique({
      where: { id: parsed.data.conversationId },
      select: { id: true, visitorId: true },
    });

    if (!conversation) {
      return apiError("Conversation not found", { status: 404 });
    }

    if (
      parsed.data.role === "visitor" &&
      parsed.data.visitorId &&
      parsed.data.visitorId !== conversation.visitorId
    ) {
      return apiError("Forbidden", { status: 403 });
    }

    const state = setTypingState({
      conversationId: conversation.id,
      role: parsed.data.role,
      isTyping: parsed.data.isTyping,
    });

    publishSupportRealtime({
      type: "typing",
      conversationId: conversation.id,
      visitorId: conversation.visitorId,
      role: parsed.data.role,
      isTyping: parsed.data.isTyping,
    });

    return apiOk({
      conversationId: conversation.id,
      ...state,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
