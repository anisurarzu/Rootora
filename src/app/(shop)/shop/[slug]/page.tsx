import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin, Star, Truck } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductTitle } from "@/components/shop/product-title";
import { TrackRecentlyViewed } from "@/components/shop/track-recently-viewed";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/features/products/components/product-actions";
import { ProductGallery } from "@/features/products/components/product-gallery";
import {
  getRelatedStorefrontProducts,
  getStorefrontProductBySlug,
} from "@/features/products/storefront-queries";
import { ProductReviews } from "@/features/reviews/components/product-reviews";
import {
  getProductReviewSummary,
  getUserReviewForProduct,
  listProductReviews,
  userHasPurchasedProduct,
} from "@/features/reviews/service";
import { getSession } from "@/lib/auth-server";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function productImageProps(url: string) {
  const isRemote = url.startsWith("http");
  return {
    unoptimized: isRemote && !url.includes("res.cloudinary.com"),
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) notFound();

  const session = await getSession();
  const [relatedProducts, reviewSummary, reviews, existingReview, canMarkVerified] =
    await Promise.all([
      getRelatedStorefrontProducts(product),
      getProductReviewSummary(product.id),
      listProductReviews(product.id),
      session?.user?.id
        ? getUserReviewForProduct(session.user.id, product.id)
        : Promise.resolve(null),
      session?.user?.id
        ? userHasPurchasedProduct(session.user.id, product.id)
        : Promise.resolve(false),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BDT",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    brand: { "@type": "Brand", name: siteConfig.name },
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <TrackRecentlyViewed
        id={product.id}
        name={product.name}
        slug={product.slug}
        image={product.images[0] ?? ""}
        price={product.price}
      />

      <div className="container-rootora section-padding">
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <div className="flex flex-wrap gap-2">
              {product.newArrival && <Badge>New</Badge>}
              {product.organic && <Badge variant="success">Organic Certified</Badge>}
              {product.freshToday && <Badge variant="accent">Fresh Today</Badge>}
              <Badge variant="outline">{product.category.name}</Badge>
            </div>

            <h1 className="mt-4 font-heading text-3xl font-semibold text-heading md:text-4xl">
              <ProductTitle name={product.name} size="page" />
            </h1>

            <a
              href="#reviews"
              className="mt-3 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      product.reviewCount > 0 &&
                      i < Math.floor(product.rating)
                        ? "fill-warning text-warning"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              {product.reviewCount > 0 ? (
                <>
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No reviews yet — write the first
                </span>
              )}
            </a>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-button text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-sm text-muted-foreground">/ {product.unit}</span>
            </div>

            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>

            <ProductActions product={product} />

            <div className="mt-8 space-y-4 rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-button text-sm font-semibold">Free Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    On orders over ৳2,000 within Dhaka
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-button text-sm font-semibold">Origin</p>
                  <p className="text-sm text-muted-foreground">{product.origin}</p>
                </div>
              </div>
            </div>

            {product.farmer && (
              <Link
                href={`/farmers/${product.farmer.slug}`}
                className="mt-6 flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <Image
                  src={product.farmer.image}
                  alt={product.farmer.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                  {...productImageProps(product.farmer.image)}
                />
                <div>
                  <p className="flex items-center gap-1 font-button text-sm font-semibold">
                    {product.farmer.name}
                    {product.farmer.verified && (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.farmer.village}, {product.farmer.district}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-16">
          <h2 className="font-heading text-2xl font-semibold text-heading">
            Product Details
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-button text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h3>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
            <div className="space-y-6">
              {(product.brand ||
                product.shelfLife ||
                (product.ingredients && product.ingredients.length > 0) ||
                product.storageInstruction ||
                product.nutrition) && (
                <div>
                  <h3 className="font-button text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Specifications
                  </h3>
                  <dl className="mt-3 overflow-hidden rounded-xl border border-border">
                    {[
                      product.brand
                        ? { label: "Brand", value: product.brand }
                        : null,
                      { label: "Net / Unit", value: product.unit },
                      { label: "Origin", value: product.origin },
                      product.shelfLife
                        ? { label: "Shelf life", value: product.shelfLife }
                        : null,
                      product.ingredients && product.ingredients.length > 0
                        ? {
                            label: "Ingredients",
                            value: product.ingredients.join(", "),
                          }
                        : null,
                      product.organic
                        ? { label: "Quality", value: "Organic / 100% Natural" }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((row) => (
                        <div
                          key={row!.label}
                          className="grid grid-cols-[140px_1fr] border-b border-border last:border-0"
                        >
                          <dt className="bg-muted/40 px-3 py-2.5 font-button text-xs font-semibold text-heading">
                            {row!.label}
                          </dt>
                          <dd className="px-3 py-2.5 text-sm text-muted-foreground">
                            {row!.value}
                          </dd>
                        </div>
                      ))}
                  </dl>

                  {product.nutrition &&
                    Object.keys(product.nutrition).length > 0 && (
                      <div className="mt-4">
                        <p className="font-button text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nutrition (approx.)
                        </p>
                        <dl className="mt-2 overflow-hidden rounded-xl border border-border">
                          {Object.entries(product.nutrition).map(
                            ([label, value]) => (
                              <div
                                key={label}
                                className="grid grid-cols-[140px_1fr] border-b border-border last:border-0"
                              >
                                <dt className="bg-muted/40 px-3 py-2.5 font-button text-xs font-semibold text-heading">
                                  {label}
                                </dt>
                                <dd className="px-3 py-2.5 text-sm text-muted-foreground">
                                  {value}
                                </dd>
                              </div>
                            )
                          )}
                        </dl>
                      </div>
                    )}

                  {product.storageInstruction ? (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-button font-semibold text-heading">
                        Storage:{" "}
                      </span>
                      {product.storageInstruction}
                    </p>
                  ) : null}
                </div>
              )}

              <div>
                <h3 className="font-button text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-button text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Availability
                </h3>
                <p className="mt-3 text-sm">
                  {product.inStock ? (
                    <span className="text-success">
                      In Stock ({product.stockCount} available)
                    </span>
                  ) : (
                    <span className="text-destructive">Out of Stock</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          summary={reviewSummary}
          reviews={reviews}
          isLoggedIn={Boolean(session?.user)}
          existingReview={
            existingReview
              ? {
                  id: existingReview.id,
                  rating: existingReview.rating,
                  comment: existingReview.comment,
                }
              : null
          }
          canMarkVerified={canMarkVerified}
        />

        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-border pt-16">
            <h2 className="font-heading text-2xl font-semibold text-heading">
              Related Products
            </h2>
            <ProductGrid className="mt-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
