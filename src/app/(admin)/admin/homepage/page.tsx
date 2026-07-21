import {
  FlashSaleManager,
} from "@/features/admin/components/flash-sale-manager";
import { toDatetimeLocalValue } from "@/features/admin/lib/datetime-local";
import { HeroManager } from "@/features/admin/components/hero-manager";
import { getFlashSaleForAdmin } from "@/features/home/flash-sale";
import { getHeroForAdmin } from "@/features/home/hero";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const session = await requirePermission("content.manage");
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("content.manage");

  const [hero, flashSale, productOptions] = await Promise.all([
    getHeroForAdmin(),
    getFlashSaleForAdmin(),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { name: "asc" },
      take: 500,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        images: true,
        price: true,
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Homepage CMS
        </h1>
        <p className="mt-2 text-muted-foreground">
          Customize the hero banners and Flash Sale sidebar shown on the
          homepage.
        </p>
      </header>

      <HeroManager
        canManage={canManage}
        slides={hero.slides.map((slide) => ({
          id: slide.id,
          image: slide.image,
          label: slide.label,
          title: slide.title,
          detail: slide.detail,
          href: slide.href,
          sortOrder: slide.sortOrder,
          active: slide.active,
        }))}
      />

      <FlashSaleManager
        canManage={canManage}
        settings={{
          enabled: flashSale.enabled,
          title: flashSale.title,
          subtitle: flashSale.subtitle ?? "",
          shopAllLabel: flashSale.shopAllLabel,
          shopAllHref: flashSale.shopAllHref,
          viewAllLabel: flashSale.viewAllLabel,
          viewAllHref: flashSale.viewAllHref,
          productLimit: flashSale.productLimit,
          useAutoSale: flashSale.useAutoSale,
          endsAt: toDatetimeLocalValue(
            flashSale.endsAt?.toISOString() ?? null
          ),
        }}
        items={flashSale.items.map((item) => {
          const price = Number(item.product.price);
          const salePrice =
            item.product.salePrice != null
              ? Number(item.product.salePrice)
              : null;
          const storedDiscount =
            item.product.discountAmount != null
              ? Number(item.product.discountAmount)
              : 0;
          const computedDiscount =
            salePrice != null && price > salePrice
              ? Math.round(((price - salePrice) / price) * 100)
              : 0;

          return {
            id: item.id,
            productId: item.productId,
            sortOrder: item.sortOrder,
            active: item.active,
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              image: item.product.thumbnail ?? item.product.images[0] ?? null,
              price,
              salePrice,
              discountPercent:
                item.product.discountType === "percentage" && storedDiscount > 0
                  ? storedDiscount
                  : computedDiscount,
              status: item.product.status,
            },
          };
        })}
        productOptions={productOptions.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.thumbnail ?? product.images[0] ?? null,
          price: Number(product.price),
        }))}
      />
    </div>
  );
}
