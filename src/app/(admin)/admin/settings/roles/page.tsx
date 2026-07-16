import { RolesManager } from "@/features/admin/components/roles-manager";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const session = await requirePermission(["roles.view", "roles.manage"]);
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("roles.manage");

  const [roles, permissionRows, users] = await Promise.all([
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        permissions: { select: { permissionId: true } },
      },
    }),
    prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { name: "asc" }],
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const userCountByRole = new Map(
    users.map((entry) => [entry.role, entry._count._all])
  );

  return (
    <RolesManager
      canManage={canManage}
      permissions={permissionRows.map((permission) => ({
        id: permission.id,
        key: permission.key,
        name: permission.name,
        module: permission.module,
        description: permission.description,
      }))}
      roles={roles.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: role.isSystem,
        permissionIds: role.permissions.map((entry) => entry.permissionId),
        userCount: userCountByRole.get(role.slug) ?? 0,
      }))}
    />
  );
}
