import { z } from "zod";
import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import {
  getOrCreateConversation,
  visitorIdSchema,
} from "@/features/support/service";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const visitorId = new URL(request.url).searchParams.get("visitorId");
    const parsed = visitorIdSchema.safeParse(visitorId);
    if (!parsed.success) {
      return apiError("visitorId is required", { status: 400 });
    }

    const conversation = await getOrCreateConversation(parsed.data);
    return apiOk(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}

const postSchema = z.object({
  visitorId: visitorIdSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid visitorId", { status: 400 });
    }

    const conversation = await getOrCreateConversation(parsed.data.visitorId);
    return apiOk(conversation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
