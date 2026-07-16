import { CategoriesManager } from "@/features/admin/components/categories-manager";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await requirePermission([
    "categories.view",
    "categories.manage",
  ]);
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("categories.manage");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Categories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create, edit, and delete catalog categories in the database.
        </p>
      </header>

      <CategoriesManager
        canManage={canManage}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          productCount: category._count.products,
          createdAt: category.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
