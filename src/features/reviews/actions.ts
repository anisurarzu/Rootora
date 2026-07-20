"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/features/admin/types";
import { userHasPurchasedProduct } from "@/features/reviews/service";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Review is too long"),
});

export async function submitProductReview(input: {
  productId: string;
  productSlug: string;
  rating: number;
  comment: string;
}): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to write a review." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid review",
    };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: parsed.data.productId,
      slug: parsed.data.productSlug,
      status: "PUBLISHED",
    },
    select: { id: true, slug: true },
  });

  if (!product) {
    return { success: false, error: "Product not found." };
  }

  const verified = await userHasPurchasedProduct(session.user.id, product.id);

  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: product.id,
      },
    },
    select: { id: true },
  });

  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: parsed.data.rating,
          comment: parsed.data.comment,
          verified,
        },
        select: { id: true },
      })
    : await prisma.review.create({
        data: {
          userId: session.user.id,
          productId: product.id,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
          verified,
        },
        select: { id: true },
      });

  revalidatePath(`/shop/${product.slug}`);
  revalidatePath("/shop");

  return {
    success: true,
    data: { id: review.id },
    message: existing ? "Review updated." : "Review submitted.",
  };
}

export async function deleteProductReview(input: {
  productId: string;
  productSlug: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in." };
  }

  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: input.productId,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: "Review not found." };
  }

  await prisma.review.delete({ where: { id: existing.id } });
  revalidatePath(`/shop/${input.productSlug}`);
  revalidatePath("/shop");

  return { success: true, message: "Review deleted." };
}
