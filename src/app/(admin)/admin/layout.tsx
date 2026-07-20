import Link from "next/link";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 bg-primary md:flex md:flex-col">
        <div className="border-b border-white/15 px-6 py-5">
          <Link href="/admin" className="block">
            <span className="font-heading text-lg font-semibold text-white">
              ROOTORA
            </span>
            <span className="mt-0.5 block font-button text-xs font-medium uppercase tracking-wider text-white/70">
              Admin
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav variant="sidebar" />
        </div>
        <div className="border-t border-white/15 p-4">
          <Link
            href="/"
            className="font-button text-sm text-white/75 transition-colors hover:text-white"
          >
            ← Back to store
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-white px-6 py-4 md:hidden">
          <Link
            href="/admin"
            className="font-heading text-lg font-semibold text-primary"
          >
            ROOTORA Admin
          </Link>
          <div className="mt-4">
            <AdminNav variant="light" />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
