import { FarmersManager } from "@/features/admin/components/farmers-manager";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFarmersPage() {
  const session = await requirePermission(["farmers.view", "farmers.manage"]);
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("farmers.manage");

  const farmers = await prisma.farmer.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Farmers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage farmer profiles used across products and the storefront.
        </p>
      </header>

      <FarmersManager
        canManage={canManage}
        farmers={farmers.map((farmer) => ({
          id: farmer.id,
          name: farmer.name,
          slug: farmer.slug,
          village: farmer.village,
          district: farmer.district,
          story: farmer.story,
          image: farmer.image,
          gallery: farmer.gallery,
          verified: farmer.verified,
          productCount: farmer._count.products,
        }))}
      />
    </div>
  );
}
