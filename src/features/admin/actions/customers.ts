"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/features/admin/types";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function revalidate(userId?: string) {
  revalidatePath("/admin/customers");
  revalidatePath("/admin/settings/users");
  revalidatePath("/admin");
  if (userId) {
    revalidatePath(`/admin/customers/${userId}`);
  }
}

export async function updateCustomerProfile(input: {
  userId: string;
  name: string;
  phone?: string;
}): Promise<ActionResult> {
  await requirePermission("customers.manage");

  const name = input.name.trim();
  if (name.length < 2) {
    return { success: false, error: "Name is required." };
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  });

  if (!user) {
    return { success: false, error: "Customer not found." };
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      name,
      phone: input.phone?.trim() || null,
    },
  });

  revalidate(input.userId);
  return { success: true, message: "Customer updated." };
}

export async function setCustomerBanned(input: {
  userId: string;
  banned: boolean;
  banReason?: string;
}): Promise<ActionResult> {
  const session = await requirePermission("customers.manage");

  if (input.userId === session.user.id) {
    return { success: false, error: "You cannot ban your own account." };
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { success: false, error: "Customer not found." };
  }

  if (user.role === "ADMIN" && input.banned) {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: "Cannot ban the only admin account." };
    }
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      banned: input.banned,
      banReason: input.banned ? input.banReason?.trim() || "Banned by admin" : null,
      banExpires: null,
    },
  });

  if (input.banned) {
    await prisma.session.deleteMany({ where: { userId: input.userId } });
  }

  revalidate(input.userId);
  return {
    success: true,
    message: input.banned ? "Customer banned." : "Customer unbanned.",
  };
}

export async function updateCustomerRole(input: {
  userId: string;
  role: string;
}): Promise<ActionResult> {
  await requirePermission(["customers.manage", "users.manage"]);

  const role = await prisma.role.findUnique({ where: { slug: input.role } });
  if (!role) {
    return { success: false, error: "Role not found." };
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { success: false, error: "Customer not found." };
  }

  if (user.role === "ADMIN" && role.slug !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: "At least one admin account is required." };
    }
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { role: role.slug },
  });

  revalidate(input.userId);
  return { success: true, message: `Role updated to ${role.name}.` };
}
