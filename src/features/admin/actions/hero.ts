"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { ensureHeroDefaults } from "@/features/home/hero";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  brandName: z.string().min(1).max(80),
  tagline: z.string().min(1).max(120),
  headline: z.string().min(1).max(160),
  description: z.string().min(1).max(400),
  ctaPrimaryLabel: z.string().min(1).max(60),
  ctaPrimaryHref: z.string().min(1).max(200),
  ctaSecondaryLabel: z.string().min(1).max(60),
  ctaSecondaryHref: z.string().min(1).max(200),
  backgroundImage: z.string().min(1).max(500),
});

const slideSchema = z.object({
  image: z.string().min(1, "Image is required"),
  label: z.string().min(1).max(40),
  title: z.string().min(1).max(80),
  detail: z.string().min(1).max(120),
  href: z.string().min(1).max(200),
  active: z.boolean().optional().default(true),
});

function revalidateHero() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateHeroSettings(
  input: unknown
): Promise<ActionResult> {
  await requirePermission("content.manage");
  await ensureHeroDefaults();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid hero settings",
    };
  }

  await prisma.heroSettings.update({
    where: { id: "default" },
    data: parsed.data,
  });

  revalidateHero();
  return { success: true, message: "Hero settings saved" };
}

export async function createHeroSlide(input: unknown): Promise<ActionResult> {
  await requirePermission("content.manage");
  await ensureHeroDefaults();

  const parsed = slideSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid slide",
    };
  }

  const maxOrder = await prisma.heroSlide.aggregate({
    where: { heroId: "default" },
    _max: { sortOrder: true },
  });

  await prisma.heroSlide.create({
    data: {
      heroId: "default",
      ...parsed.data,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidateHero();
  return { success: true, message: "Slide added" };
}

export async function updateHeroSlide(
  id: string,
  input: unknown
): Promise<ActionResult> {
  await requirePermission("content.manage");

  const parsed = slideSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid slide",
    };
  }

  await prisma.heroSlide.update({
    where: { id },
    data: parsed.data,
  });

  revalidateHero();
  return { success: true, message: "Slide updated" };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  await requirePermission("content.manage");

  await prisma.heroSlide.delete({ where: { id } });

  revalidateHero();
  return { success: true, message: "Slide deleted" };
}

export async function reorderHeroSlides(
  orderedIds: string[]
): Promise<ActionResult> {
  await requirePermission("content.manage");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.heroSlide.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidateHero();
  return { success: true, message: "Slide order updated" };
}
