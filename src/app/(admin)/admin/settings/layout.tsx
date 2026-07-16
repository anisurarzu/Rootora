import { SettingsNav } from "@/features/admin/components/settings-nav";
import { requirePermission } from "@/lib/auth-server";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission(["settings.manage", "roles.view", "users.manage"]);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-heading">
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage roles, permissions, and user access for the admin panel.
          </p>
        </div>
        <SettingsNav />
      </header>
      {children}
    </div>
  );
}
