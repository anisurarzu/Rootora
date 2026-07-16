"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type RoleActionResult =
  | { success: true; message?: string; data?: { id: string } }
  | { success: false; error: string };

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

function revalidateSettings() {
  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/roles");
  revalidatePath("/admin/settings/users");
  revalidatePath("/admin");
}

export async function createRole(input: {
  name: string;
  slug?: string;
  description?: string;
  permissionIds: string[];
}): Promise<RoleActionResult> {
  await requirePermission("roles.manage");

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid role" };
  }

  const slug = (parsed.data.slug?.trim() || slugify(parsed.data.name)).toUpperCase();

  const existing = await prisma.role.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: "A role with this slug already exists." };
  }

  const role = await prisma.role.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description?.trim() || null,
      isSystem: false,
      permissions: {
        create: parsed.data.permissionIds.map((permissionId) => ({
          permissionId,
        })),
      },
    },
    select: { id: true },
  });

  revalidateSettings();
  return { success: true, message: "Role created.", data: role };
}

export async function updateRole(
  roleId: string,
  input: {
    name: string;
    description?: string;
    permissionIds: string[];
  }
): Promise<RoleActionResult> {
  await requirePermission("roles.manage");

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return { success: false, error: "Role not found." };
  }

  const parsed = roleSchema.safeParse({
    ...input,
    slug: role.slug,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid role" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id: roleId },
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
      },
    });

    await tx.rolePermission.deleteMany({ where: { roleId } });

    if (parsed.data.permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: parsed.data.permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }
  });

  revalidateSettings();
  return { success: true, message: "Role updated." };
}

export async function deleteRole(roleId: string): Promise<RoleActionResult> {
  await requirePermission("roles.manage");

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return { success: false, error: "Role not found." };
  }

  if (role.isSystem) {
    return { success: false, error: "System roles cannot be deleted." };
  }

  const assignedUsers = await prisma.user.count({
    where: { role: role.slug },
  });

  if (assignedUsers > 0) {
    return {
      success: false,
      error: `Cannot delete role assigned to ${assignedUsers} user(s). Reassign them first.`,
    };
  }

  await prisma.role.delete({ where: { id: roleId } });
  revalidateSettings();
  return { success: true, message: "Role deleted." };
}

export async function assignUserRole(
  userId: string,
  roleSlug: string
): Promise<RoleActionResult> {
  const session = await requirePermission(["users.manage", "roles.manage"]);

  const role = await prisma.role.findUnique({ where: { slug: roleSlug } });
  if (!role) {
    return { success: false, error: "Role not found." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  if (user.id === session.user.id && roleSlug !== "ADMIN") {
    return {
      success: false,
      error: "You cannot remove your own admin access.",
    };
  }

  if (user.role === "ADMIN" && roleSlug !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return {
        success: false,
        error: "At least one admin account is required.",
      };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role.slug },
  });

  revalidateSettings();
  revalidatePath("/admin/customers");
  return {
    success: true,
    message: `Assigned ${role.name} to ${user.email}.`,
  };
}
