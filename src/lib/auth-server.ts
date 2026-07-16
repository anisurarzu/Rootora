import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { PermissionKey } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function getPermissionsForRole(roleSlug?: string | null) {
  if (!roleSlug) return [] as string[];

  if (roleSlug === "ADMIN") {
    const permissions = await prisma.permission.findMany({
      select: { key: true },
    });
    return permissions.map((permission) => permission.key);
  }

  const role = await prisma.role.findUnique({
    where: { slug: roleSlug },
    include: {
      permissions: {
        include: { permission: { select: { key: true } } },
      },
    },
  });

  return (
    role?.permissions.map((entry) => entry.permission.key) ?? ([] as string[])
  );
}

export async function userHasPermission(
  roleSlug: string | null | undefined,
  permission: PermissionKey | PermissionKey[]
) {
  if (!roleSlug) return false;
  if (roleSlug === "ADMIN") return true;

  const required = Array.isArray(permission) ? permission : [permission];
  const granted = await getPermissionsForRole(roleSlug);

  return required.some((key) => granted.includes(key));
}

export async function requireAdmin() {
  const session = await requireSession();
  const allowed = await userHasPermission(session.user.role, "admin.access");

  if (!allowed) {
    redirect("/account");
  }

  return session;
}

export async function requirePermission(
  permission: PermissionKey | PermissionKey[]
) {
  const session = await requireAdmin();
  const allowed = await userHasPermission(session.user.role, permission);

  if (!allowed) {
    redirect("/admin");
  }

  return session;
}

export function isAdminRole(role?: string | null) {
  return role === "ADMIN";
}

export async function canAccessAdmin(role?: string | null) {
  return userHasPermission(role, "admin.access");
}
