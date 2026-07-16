"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

function revalidate() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  await requirePermission("categories.manage");

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    return { success: false, error: "A valid slug is required." };
  }

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: "A category with this slug already exists." };
  }

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parsed.data.parentId },
    });
    if (!parent) {
      return { success: false, error: "Parent category not found." };
    }
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description?.trim() || null,
      image: parsed.data.image?.trim() || null,
      parentId: parsed.data.parentId || null,
    },
    select: { id: true },
  });

  revalidate();
  return { success: true, data: category, message: "Category created." };
}

export async function updateCategory(
  categoryId: string,
  input: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    parentId?: string | null;
  }
): Promise<ActionResult> {
  await requirePermission("categories.manage");

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { success: false, error: "Category not found." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  const clash = await prisma.category.findFirst({
    where: { slug, NOT: { id: categoryId } },
  });
  if (clash) {
    return { success: false, error: "A category with this slug already exists." };
  }

  if (parsed.data.parentId === categoryId) {
    return { success: false, error: "A category cannot be its own parent." };
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description?.trim() || null,
      image: parsed.data.image?.trim() || null,
      parentId: parsed.data.parentId || null,
    },
  });

  revalidate();
  return { success: true, message: "Category updated." };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  await requirePermission("categories.manage");

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });

  if (!category) {
    return { success: false, error: "Category not found." };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error: `Cannot delete: ${category._count.products} product(s) still use this category.`,
    };
  }

  if (category._count.children > 0) {
    return {
      success: false,
      error: "Cannot delete: remove or reassign child categories first.",
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidate();
  return { success: true, message: "Category deleted." };
}
