import { z } from "zod";
import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import {
  getVisitorConversationSince,
  sendVisitorMessage,
  visitorIdSchema,
} from "@/features/support/service";
import { publishSupportRealtime } from "@/features/support/realtime";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const visitorId = url.searchParams.get("visitorId");
    const since = url.searchParams.get("since") ?? undefined;
    const parsed = visitorIdSchema.safeParse(visitorId);
    if (!parsed.success) {
      return apiError("visitorId is required", { status: 400 });
    }

    const data = await getVisitorConversationSince(parsed.data, since);
    return apiOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}

const postSchema = z.object({
  visitorId: visitorIdSchema,
  body: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid message", {
        status: 400,
      });
    }

    const result = await sendVisitorMessage(parsed.data);
    publishSupportRealtime({
      type: "message",
      conversationId: result.conversationId,
      visitorId: result.visitorId,
      status: result.status,
      needsEmailForAgent: result.needsEmailForAgent,
      messages: result.messages,
    });
    return apiOk(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
