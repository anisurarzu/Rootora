import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/features/admin/products/components/product-form";
import { productToFormValues } from "@/features/admin/products/mappers";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, farmers] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        category: true,
        farmer: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.farmer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

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
          Edit product
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update “{product.name}” and manage publishing status.
        </p>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        defaultValues={productToFormValues(product)}
        categories={categories}
        farmers={farmers}
      />
    </div>
  );
}
