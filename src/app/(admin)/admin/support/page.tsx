import { AdminSupportInbox } from "@/features/support/components/admin-support-inbox";
import {
  getAdminConversation,
  listAdminConversations,
} from "@/features/support/service";
import { requirePermission } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

interface AdminSupportPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AdminSupportPage({
  searchParams,
}: AdminSupportPageProps) {
  await requirePermission(["admin.access"]);
  const params = await searchParams;

  const conversations = await listAdminConversations();
  const selectedId = params.id || conversations[0]?.id;
  const initialConversation = selectedId
    ? await getAdminConversation(selectedId)
    : null;

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Support chat
        </h1>
        <p className="mt-2 text-muted-foreground">
          Reply to customers who shared their email. Bot-only chats stay private
          until they claim with an email.
        </p>
      </header>

      <AdminSupportInbox
        conversations={conversations}
        initialConversation={initialConversation}
      />
    </div>
  );
}
