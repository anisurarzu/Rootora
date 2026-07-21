"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { ensureHeroDefaults } from "@/features/home/hero";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile } from "@/lib/uploads";

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);
}

const settingsSchema = z.object({
  brandName: requiredText("Brand name", 80),
  tagline: requiredText("Tagline", 120),
  headline: requiredText("Headline", 160),
  description: requiredText("Description", 400),
  ctaPrimaryLabel: requiredText("Primary CTA label", 60),
  ctaPrimaryHref: requiredText("Primary CTA link", 200),
  // Secondary CTA is optional on the live homepage
  ctaSecondaryLabel: z.string().trim().max(60).default(""),
  ctaSecondaryHref: z.string().trim().max(200).default(""),
  backgroundImage: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || "/images/hero-produce-original.png"),
});

const slideSchema = z.object({
  image: z
    .string()
    .trim()
    .min(1, "Please upload a campaign image before saving"),
  href: requiredText("Link", 200),
  label: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || "Campaign"),
  title: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || "Campaign"),
  detail: z
    .string()
    .trim()
    .max(120)
    .transform((value) => value || "Shop now"),
  active: z.boolean().optional().default(true),
});

function firstIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input";
}

function revalidateHero() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateHeroSettings(
  input: unknown,
): Promise<ActionResult> {
  await requirePermission("content.manage");
  await ensureHeroDefaults();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: firstIssueMessage(parsed.error),
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
      error: firstIssueMessage(parsed.error),
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
  input: unknown,
): Promise<ActionResult> {
  await requirePermission("content.manage");

  const parsed = slideSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: firstIssueMessage(parsed.error),
    };
  }

  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Slide not found." };
  }

  await prisma.heroSlide.update({
    where: { id },
    data: parsed.data,
  });

  // Remove replaced image from Cloudinary / local uploads
  if (existing.image && existing.image !== parsed.data.image) {
    try {
      await deleteUploadedFile(existing.image);
    } catch (error) {
      console.error("Failed to delete old hero slide image", error);
    }
  }

  revalidateHero();
  return { success: true, message: "Slide updated" };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  await requirePermission("content.manage");

  if (!id?.trim()) {
    return { success: false, error: "Invalid slide id." };
  }

  try {
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      revalidateHero();
      return { success: false, error: "Slide not found or already deleted." };
    }

    await prisma.heroSlide.delete({ where: { id } });

    if (existing.image) {
      try {
        await deleteUploadedFile(existing.image);
      } catch (error) {
        console.error("Failed to delete hero slide image from storage", error);
      }
    }

    revalidateHero();
    return { success: true, message: "Slide deleted" };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete slide",
    };
  }
}

export async function reorderHeroSlides(
  orderedIds: string[],
): Promise<ActionResult> {
  await requirePermission("content.manage");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.heroSlide.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateHero();
  return { success: true, message: "Slide order updated" };
}
