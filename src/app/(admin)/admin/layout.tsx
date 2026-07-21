import { AdminChrome } from "@/features/admin/components/admin-chrome";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminChrome>{children}</AdminChrome>;
}
