import { z } from "zod";
import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { publishSupportRealtime } from "@/features/support/realtime";
import {
  switchConversationToBot,
  visitorIdSchema,
} from "@/features/support/service";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

const postSchema = z.object({
  visitorId: visitorIdSchema,
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", {
        status: 400,
      });
    }

    const result = await switchConversationToBot(parsed.data.visitorId);
    publishSupportRealtime({
      type: "message",
      conversationId: result.id,
      visitorId: result.visitorId,
      status: result.status,
      needsEmailForAgent: result.needsEmailForAgent,
      messages: result.messages,
    });
    publishSupportRealtime({
      type: "conversation:update",
      conversationId: result.id,
      visitorId: result.visitorId,
      status: result.status,
      guestEmail: result.guestEmail,
      guestName: result.guestName,
    });
    return apiOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
