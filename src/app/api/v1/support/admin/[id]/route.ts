import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { requireApiSession } from "@/lib/api/auth";
import { userHasPermission } from "@/lib/auth-server";
import { getAdminConversation } from "@/features/support/service";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { user } = await requireApiSession(request);
    const allowed = await userHasPermission(user.role, "admin.access");
    if (!allowed) {
      return apiError("Forbidden", { status: 403, code: "FORBIDDEN" });
    }

    const { id } = await context.params;
    const conversation = await getAdminConversation(id);
    if (!conversation) {
      return apiError("Conversation not found", { status: 404 });
    }

    return apiOk(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}
