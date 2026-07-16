import { UsersRoleManager } from "@/features/admin/components/users-role-manager";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsUsersPage() {
  const session = await requirePermission(["users.manage", "roles.view"]);
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("users.manage");

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <UsersRoleManager
      canManage={canManage}
      currentUserId={session.user.id}
      roles={roles}
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      }))}
    />
  );
}
