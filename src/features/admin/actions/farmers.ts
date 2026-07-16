"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const farmerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  village: z.string().min(1, "Village is required"),
  district: z.string().min(1, "District is required"),
  story: z.string().min(10, "Story must be at least 10 characters"),
  image: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
});

function revalidate(slug?: string) {
  revalidatePath("/admin/farmers");
  revalidatePath("/admin/products");
  revalidatePath("/farmers");
  if (slug) {
    revalidatePath(`/farmers/${slug}`);
  }
}

export async function createFarmer(input: {
  name: string;
  slug?: string;
  village: string;
  district: string;
  story: string;
  image?: string;
  gallery?: string[];
  verified?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  await requirePermission("farmers.manage");

  const parsed = farmerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid farmer" };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  const existing = await prisma.farmer.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: "A farmer with this slug already exists." };
  }

  const farmer = await prisma.farmer.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      village: parsed.data.village.trim(),
      district: parsed.data.district.trim(),
      story: parsed.data.story.trim(),
      image: parsed.data.image?.trim() || null,
      gallery: parsed.data.gallery ?? [],
      verified: parsed.data.verified,
    },
    select: { id: true, slug: true },
  });

  revalidate(farmer.slug);
  return { success: true, data: { id: farmer.id }, message: "Farmer created." };
}

export async function updateFarmer(
  farmerId: string,
  input: {
    name: string;
    slug?: string;
    village: string;
    district: string;
    story: string;
    image?: string;
    gallery?: string[];
    verified?: boolean;
  }
): Promise<ActionResult> {
  await requirePermission("farmers.manage");

  const parsed = farmerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid farmer" };
  }

  const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
  if (!farmer) {
    return { success: false, error: "Farmer not found." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  const clash = await prisma.farmer.findFirst({
    where: { slug, NOT: { id: farmerId } },
  });
  if (clash) {
    return { success: false, error: "A farmer with this slug already exists." };
  }

  await prisma.farmer.update({
    where: { id: farmerId },
    data: {
      name: parsed.data.name.trim(),
      slug,
      village: parsed.data.village.trim(),
      district: parsed.data.district.trim(),
      story: parsed.data.story.trim(),
      image: parsed.data.image?.trim() || null,
      gallery: parsed.data.gallery ?? [],
      verified: parsed.data.verified,
    },
  });

  revalidate(slug);
  return { success: true, message: "Farmer updated." };
}

export async function deleteFarmer(farmerId: string): Promise<ActionResult> {
  await requirePermission("farmers.manage");

  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: { _count: { select: { products: true } } },
  });

  if (!farmer) {
    return { success: false, error: "Farmer not found." };
  }

  if (farmer._count.products > 0) {
    return {
      success: false,
      error: `Cannot delete: ${farmer._count.products} product(s) are linked to this farmer.`,
    };
  }

  await prisma.farmer.delete({ where: { id: farmerId } });
  revalidate(farmer.slug);
  return { success: true, message: "Farmer deleted." };
}
