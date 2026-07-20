"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const postSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug: z.string().trim().optional(),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  type: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  stipend: z.string().trim().max(80).optional().or(z.literal("")),
  schedule: z.string().trim().max(120).optional().or(z.literal("")),
  openings: z.coerce.number().int().min(1).max(50).default(1),
  summary: z.string().trim().min(10, "Summary is required").max(4000),
  responsibilitiesText: z.string().trim().max(8000).optional().or(z.literal("")),
  requirementsText: z.string().trim().max(8000).optional().or(z.literal("")),
  alwaysOpen: z.boolean().default(true),
  published: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

function revalidateCareers() {
  revalidatePath("/careers");
  revalidatePath("/admin/careers");
}

export async function createCareerPost(input: {
  title: string;
  slug?: string;
  department?: string;
  type?: string;
  location?: string;
  stipend?: string;
  schedule?: string;
  openings?: number;
  summary: string;
  responsibilitiesText?: string;
  requirementsText?: string;
  alwaysOpen?: boolean;
  published?: boolean;
  sortOrder?: number;
}): Promise<ActionResult<{ id: string }>> {
  await requirePermission(["admin.access"]);
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid job post",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const existing = await prisma.careerPost.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: "A job with this slug already exists." };
  }

  const post = await prisma.careerPost.create({
    data: {
      title: parsed.data.title,
      slug,
      department: emptyToNull(parsed.data.department),
      type: emptyToNull(parsed.data.type),
      location: emptyToNull(parsed.data.location),
      stipend: emptyToNull(parsed.data.stipend),
      schedule: emptyToNull(parsed.data.schedule),
      openings: parsed.data.openings,
      summary: parsed.data.summary,
      responsibilities: parseLines(parsed.data.responsibilitiesText ?? ""),
      requirements: parseLines(parsed.data.requirementsText ?? ""),
      alwaysOpen: parsed.data.alwaysOpen,
      published: parsed.data.published,
      sortOrder: parsed.data.sortOrder,
    },
    select: { id: true },
  });

  revalidateCareers();
  return { success: true, data: { id: post.id }, message: "Job post created." };
}

export async function updateCareerPost(
  id: string,
  input: {
    title: string;
    slug?: string;
    department?: string;
    type?: string;
    location?: string;
    stipend?: string;
    schedule?: string;
    openings?: number;
    summary: string;
    responsibilitiesText?: string;
    requirementsText?: string;
    alwaysOpen?: boolean;
    published?: boolean;
    sortOrder?: number;
  }
): Promise<ActionResult> {
  await requirePermission(["admin.access"]);
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid job post",
    };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const clash = await prisma.careerPost.findFirst({
    where: { slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    return { success: false, error: "A job with this slug already exists." };
  }

  await prisma.careerPost.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      department: emptyToNull(parsed.data.department),
      type: emptyToNull(parsed.data.type),
      location: emptyToNull(parsed.data.location),
      stipend: emptyToNull(parsed.data.stipend),
      schedule: emptyToNull(parsed.data.schedule),
      openings: parsed.data.openings,
      summary: parsed.data.summary,
      responsibilities: parseLines(parsed.data.responsibilitiesText ?? ""),
      requirements: parseLines(parsed.data.requirementsText ?? ""),
      alwaysOpen: parsed.data.alwaysOpen,
      published: parsed.data.published,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidateCareers();
  return { success: true, message: "Job post updated." };
}

export async function deleteCareerPost(id: string): Promise<ActionResult> {
  await requirePermission(["admin.access"]);
  await prisma.careerPost.delete({ where: { id } });
  revalidateCareers();
  return { success: true, message: "Job post deleted." };
}

const applySchema = z.object({
  positionSlug: z.string().min(1),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(160),
  phone: z.string().trim().min(8, "Phone number is required").max(30),
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

  const post = await prisma.careerPost.findFirst({
    where: {
      slug: parsed.data.positionSlug,
      published: true,
    },
  });
  if (!post) {
    return { success: false, error: "Selected position is not available." };
  }

  const recent = await prisma.careerApplication.findFirst({
    where: {
      email: parsed.data.email.toLowerCase(),
      positionSlug: post.slug,
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    select: { id: true },
  });

  if (recent) {
    return {
      success: false,
      error:
        "You already applied for this role today. Please wait before applying again.",
    };
  }

  const application = await prisma.careerApplication.create({
    data: {
      postId: post.id,
      positionSlug: post.slug,
      positionTitle: post.title,
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
