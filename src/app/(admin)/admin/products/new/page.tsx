import Link from "next/link";
import { ProductForm } from "@/features/admin/products/components/product-form";
import { emptyProductFormValues } from "@/features/admin/products/schema";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();

  const [categories, farmers] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.farmer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="font-button text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to products
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-heading">
          Add product
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a new catalog item with pricing, inventory, media, and SEO.
        </p>
      </div>

      <ProductForm
        mode="create"
        defaultValues={{
          ...emptyProductFormValues,
          categoryId: categories[0]?.id ?? "",
        }}
        categories={categories}
        farmers={farmers}
      />
    </div>
  );
}
