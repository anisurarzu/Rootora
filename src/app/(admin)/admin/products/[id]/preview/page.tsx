import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-server";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPreviewPage({ params }: PreviewPageProps) {
  await requireAdmin();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      farmer: true,
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  const image = product.thumbnail || product.images[0];
  const nutrition =
    product.nutrition && typeof product.nutrition === "object"
      ? (product.nutrition as Record<string, unknown>)
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="font-button text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to products
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-heading">
            Preview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin preview of the product storefront content.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
          </Button>
          <Button asChild>
            <Link href={`/shop/${product.slug}`} target="_blank">
              Open storefront
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={!image.includes("res.cloudinary.com")}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {product.images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2 p-4">
                {product.images.slice(0, 4).map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={!url.includes("res.cloudinary.com")}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.status === "PUBLISHED" ? "success" : "secondary"}>
                {product.status}
              </Badge>
              {product.organic ? <Badge>Organic</Badge> : null}
              {product.featured ? <Badge variant="accent">Featured</Badge> : null}
              {product.trending ? <Badge variant="outline">Trending</Badge> : null}
            </div>
            <CardTitle className="mt-3 text-3xl">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {product.category.name}
              {product.brand ? ` · ${product.brand}` : ""}
              {product.sku ? ` · SKU ${product.sku}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-3xl font-semibold text-heading">
                {formatPrice(
                  Number(product.salePrice ?? product.price)
                )}
              </span>
              {product.salePrice != null ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(Number(product.price))}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription || product.description}
            </p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="font-medium text-heading">{product.stockCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-heading">{product.stockStatus}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Origin</dt>
                <dd className="font-medium text-heading">
                  {product.originDistrict || product.origin || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Farmer</dt>
                <dd className="font-medium text-heading">
                  {product.farmer?.name || product.farmName || "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {product.productStory ? (
              <div>
                <p className="font-button font-medium text-heading">Story</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {product.productStory}
                </p>
              </div>
            ) : null}
            {nutrition ? (
              <div>
                <p className="font-button font-medium text-heading">Nutrition</p>
                <ul className="mt-1 grid grid-cols-2 gap-2 text-muted-foreground">
                  {Object.entries(nutrition).map(([key, value]) =>
                    value ? (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            ) : null}
            {product.variants.length > 0 ? (
              <div>
                <p className="font-button font-medium text-heading">Variants</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {product.variants.map((variant) => (
                    <li key={variant.id}>
                      {variant.name}: {variant.value}
                      {variant.price != null
                        ? ` · ${formatPrice(Number(variant.price))}`
                        : ""}
                      {` · stock ${variant.stockCount}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
