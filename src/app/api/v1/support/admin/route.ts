import {
  apiError,
  apiOk,
  apiOptions,
  handleApiError,
} from "@/lib/api/response";
import { requireApiSession } from "@/lib/api/auth";
import { userHasPermission } from "@/lib/auth-server";
import {
  countSupportAttention,
  listAdminConversations,
} from "@/features/support/service";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return apiOptions();
}

export async function GET(request: Request) {
  try {
    const { user } = await requireApiSession(request);
    const allowed = await userHasPermission(user.role, "admin.access");
    if (!allowed) {
      return apiError("Forbidden", { status: 403, code: "FORBIDDEN" });
    }

    const conversations = await listAdminConversations();
    return apiOk({
      conversations,
      attentionCount: countSupportAttention(conversations),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
