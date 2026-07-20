"use server";

import { SupportConversationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/features/admin/types";
import {
  sendAgentReply,
  updateConversationStatus,
  deleteSupportConversation,
} from "@/features/support/service";
import { publishSupportRealtime } from "@/features/support/realtime";
import { requirePermission } from "@/lib/auth-server";

export async function replyToSupportChat(
  conversationId: string,
  body: string
): Promise<ActionResult<{ messageId: string }>> {
  const session = await requirePermission(["admin.access"]);

  try {
    const message = await sendAgentReply({
      conversationId,
      agentUserId: session.user.id,
      body,
    });
    publishSupportRealtime({
      type: "message",
      conversationId: message.conversationId,
      visitorId: message.visitorId,
      status: message.status,
      needsEmailForAgent: message.needsEmailForAgent,
      messages: [
        {
          id: message.id,
          sender: message.sender,
          body: message.body,
          createdAt: message.createdAt,
          agentUserId: message.agentUserId,
        },
      ],
    });
    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${conversationId}`);
    return {
      success: true,
      data: { messageId: message.id },
      message: "Reply sent",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not send reply",
    };
  }
}

export async function closeSupportConversation(
  conversationId: string
): Promise<ActionResult> {
  await requirePermission(["admin.access"]);

  try {
    await updateConversationStatus(
      conversationId,
      SupportConversationStatus.CLOSED
    );
    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${conversationId}`);
    return { success: true, message: "Conversation closed" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not close chat",
    };
  }
}

export async function deleteSupportChat(
  conversationId: string
): Promise<ActionResult> {
  await requirePermission(["admin.access"]);

  try {
    const deleted = await deleteSupportConversation(conversationId);
    publishSupportRealtime({
      type: "conversation:update",
      conversationId: deleted.id,
      visitorId: deleted.visitorId,
      status: "CLOSED",
    });
    revalidatePath("/admin/support");
    return { success: true, message: "Conversation deleted" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete chat",
    };
  }
}
