import { z } from "zod";
import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import {
  claimConversationWithEmail,
  emailSchema,
  visitorIdSchema,
} from "@/features/support/service";
import { publishSupportRealtime } from "@/features/support/realtime";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

const postSchema = z.object({
  visitorId: visitorIdSchema,
  email: emailSchema,
  name: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid email", {
        status: 400,
      });
    }

    const result = await claimConversationWithEmail(parsed.data);
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
