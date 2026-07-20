"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { getCareerPosition } from "@/features/careers/positions";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const applySchema = z.object({
  positionSlug: z.string().min(1),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(160),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number is required")
    .max(30),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  education: z.string().trim().max(160).optional().or(z.literal("")),
  facebookUrl: z.string().trim().max(300).optional().or(z.literal("")),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  about: z
    .string()
    .trim()
    .min(20, "Tell us a bit more about yourself (at least 20 characters)")
    .max(4000),
  availability: z.string().trim().max(300).optional().or(z.literal("")),
});

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function submitCareerApplication(input: {
  positionSlug: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  education?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  about: string;
  availability?: string;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = applySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid application",
    };
  }

  const position = getCareerPosition(parsed.data.positionSlug);
  if (!position) {
    return { success: false, error: "Selected position is not available." };
  }

  const recent = await prisma.careerApplication.findFirst({
    where: {
      email: parsed.data.email.toLowerCase(),
      positionSlug: position.slug,
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    select: { id: true },
  });

  if (recent) {
    return {
      success: false,
      error: "You already applied for this role today. Please wait before applying again.",
    };
  }

  const application = await prisma.careerApplication.create({
    data: {
      positionSlug: position.slug,
      positionTitle: position.title,
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      city: emptyToNull(parsed.data.city),
      education: emptyToNull(parsed.data.education),
      facebookUrl: emptyToNull(parsed.data.facebookUrl),
      instagramUrl: emptyToNull(parsed.data.instagramUrl),
      about: parsed.data.about,
      availability: emptyToNull(parsed.data.availability),
    },
    select: { id: true },
  });

  revalidatePath("/admin/careers");
  return {
    success: true,
    data: { id: application.id },
    message: "Application submitted",
  };
}

const statusSchema = z.enum([
  "NEW",
  "REVIEWED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
]);

export async function updateCareerApplicationStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  await requirePermission(["admin.access"]);
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false, error: "Invalid status" };
  }

  await prisma.careerApplication.update({
    where: { id },
    data: { status: parsed.data },
  });

  revalidatePath("/admin/careers");
  return { success: true, message: "Status updated" };
}

export async function deleteCareerApplication(
  id: string
): Promise<ActionResult> {
  await requirePermission(["admin.access"]);

  await prisma.careerApplication.delete({ where: { id } });
  revalidatePath("/admin/careers");
  return { success: true, message: "Application deleted" };
}
