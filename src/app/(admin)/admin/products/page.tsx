import { ProductsTable } from "@/features/admin/products/components/products-table";
import { getAdminProductsList } from "@/features/admin/actions/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProductsList(),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return <ProductsTable products={products} categories={categories} />;
}
