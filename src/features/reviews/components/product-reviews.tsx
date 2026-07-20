"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteProductReview,
  submitProductReview,
} from "@/features/reviews/actions";
import type {
  ProductReviewItem,
  ReviewSummary,
} from "@/features/reviews/service";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "highest" | "lowest";

type ProductReviewsProps = {
  productId: string;
  productSlug: string;
  summary: ReviewSummary;
  reviews: ProductReviewItem[];
  isLoggedIn: boolean;
  existingReview: {
    id: string;
    rating: number;
    comment: string;
  } | null;
  canMarkVerified: boolean;
};

function StarRow({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i < Math.round(rating)
              ? "fill-warning text-warning"
              : "text-border"
          )}
        />
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ProductReviews({
  productId,
  productSlug,
  summary,
  reviews: initialReviews,
  isLoggedIn,
  existingReview,
  canMarkVerified,
}: ProductReviewsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sort, setSort] = useState<SortKey>("newest");
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [showForm, setShowForm] = useState(!existingReview);

  const reviews = useMemo(() => {
    const next = [...initialReviews];
    if (sort === "highest") {
      next.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    } else if (sort === "lowest") {
      next.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
    } else {
      next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return next;
  }, [initialReviews, sort]);

  function onSubmit() {
    if (!isLoggedIn) {
      toast.error("Please sign in to write a review.");
      return;
    }
    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitProductReview({
        productId,
        productSlug,
        rating,
        comment,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setShowForm(false);
      router.refresh();
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteProductReview({ productId, productSlug });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setRating(0);
      setComment("");
      setShowForm(true);
      router.refresh();
    });
  }

  return (
    <section id="reviews" className="mt-16 border-t border-border pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-heading">
            Reviews
            {summary.count > 0 ? (
              <span className="ml-2 text-primary">{summary.average.toFixed(1)}</span>
            ) : null}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.count > 0
              ? `${summary.count} review${summary.count === 1 ? "" : "s"} from ROOTORA customers`
              : "No reviews yet — be the first to share your experience."}
          </p>
        </div>
        {summary.count > 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
            Verified purchases marked
          </div>
        ) : null}
      </div>

      {summary.count > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <div className="rounded-xl border border-border bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <p className="font-heading text-4xl font-semibold text-heading">
                {summary.average.toFixed(1)}
              </p>
              <div>
                <StarRow rating={summary.average} size="md" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {summary.count} ratings
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = summary.distribution[star];
                const pct =
                  summary.count > 0
                    ? Math.round((count / summary.count) * 100)
                    : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/70">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-heading">
                Customer reviews
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>

            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-border bg-surface p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-button text-sm font-semibold text-primary">
                        {review.author.name[0]?.toUpperCase() ?? "C"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">
                          {review.author.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <StarRow rating={review.rating} />
                          {review.verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Verified purchase
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="mt-10 rounded-xl border border-border bg-muted/20 p-5 md:p-6">
        <h3 className="font-heading text-lg font-semibold text-heading">
          {existingReview ? "Your review" : "Write a review"}
        </h3>
        {!isLoggedIn ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Please{" "}
            <Link
              href={`/login?next=${encodeURIComponent(`/shop/${productSlug}#reviews`)}`}
              className="font-medium text-primary hover:underline"
            >
              sign in
            </Link>{" "}
            to leave a review.
          </p>
        ) : (
          <>
            {canMarkVerified ? (
              <p className="mt-2 text-xs text-emerald-700">
                You’ll get a verified purchase badge — we found this product in
                your orders.
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Anyone signed in can review. Buyers get a verified purchase
                badge.
              </p>
            )}

            {existingReview && !showForm ? (
              <div className="mt-4 space-y-3">
                <StarRow rating={existingReview.rating} size="md" />
                <p className="text-sm text-muted-foreground">
                  {existingReview.comment}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowForm(true)}
                  >
                    Edit review
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-heading">Rating</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const active = (hoverRating || rating) >= value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`${value} star${value === 1 ? "" : "s"}`}
                          className="rounded p-0.5 transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(value)}
                        >
                          <Star
                            className={cn(
                              "h-7 w-7",
                              active
                                ? "fill-warning text-warning"
                                : "text-border"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-heading">
                    Your review
                  </p>
                  <Textarea
                    rows={4}
                    value={comment}
                    maxLength={2000}
                    placeholder="How was the quality, packaging, and delivery?"
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={pending || rating < 1 || comment.trim().length < 10}
                    onClick={onSubmit}
                  >
                    {pending
                      ? "Saving…"
                      : existingReview
                        ? "Update review"
                        : "Submit review"}
                  </Button>
                  {existingReview ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setRating(existingReview.rating);
                        setComment(existingReview.comment);
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
