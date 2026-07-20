import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_CODE_ACTIVE } from "@/features/orders/order-status-code";

export type ProductReviewItem = {
  id: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type ReviewSummary = {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

function maskName(name: string) {
  const trimmed = name.trim() || "Customer";
  if (trimmed.length <= 2) return `${trimmed[0] ?? "C"}***`;
  return `${trimmed[0]}***${trimmed[trimmed.length - 1]}`;
}

export async function userHasPurchasedProduct(
  userId: string,
  productId: string
) {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        statusCode: ORDER_STATUS_CODE_ACTIVE,
        status: {
          in: [
            OrderStatus.DELIVERED,
            OrderStatus.SHIPPED,
            OrderStatus.PROCESSING,
            OrderStatus.CONFIRMED,
          ],
        },
      },
    },
    select: { id: true },
  });
  return Boolean(item);
}

export async function getProductReviewSummary(
  productId: string
): Promise<ReviewSummary> {
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });

  const distribution: ReviewSummary["distribution"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let total = 0;
  let sum = 0;
  for (const row of grouped) {
    const rating = row.rating as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      distribution[rating] = row._count.rating;
      total += row._count.rating;
      sum += rating * row._count.rating;
    }
  }

  return {
    average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    count: total,
    distribution,
  };
}

export async function listProductReviews(
  productId: string,
  options?: { sort?: "newest" | "highest" | "lowest"; take?: number }
): Promise<ProductReviewItem[]> {
  const sort = options?.sort ?? "newest";
  const take = options?.take ?? 50;

  const reviews = await prisma.review.findMany({
    where: { productId },
    take,
    orderBy:
      sort === "highest"
        ? [{ rating: "desc" }, { createdAt: "desc" }]
        : sort === "lowest"
          ? [{ rating: "asc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    verified: review.verified,
    createdAt: review.createdAt.toISOString(),
    author: {
      id: review.user.id,
      name: maskName(review.user.name || "Customer"),
      image: review.user.image,
    },
  }));
}

export async function getUserReviewForProduct(
  userId: string,
  productId: string
) {
  return prisma.review.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      verified: true,
      createdAt: true,
    },
  });
}
