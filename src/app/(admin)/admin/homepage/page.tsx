import { HeroManager } from "@/features/admin/components/hero-manager";
import { getHeroForAdmin } from "@/features/home/hero";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const session = await requirePermission("content.manage");
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("content.manage");
  const hero = await getHeroForAdmin();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Homepage CMS
        </h1>
        <p className="mt-2 text-muted-foreground">
          Customize the hero section — text, background, and rotating offer
          cards. Changes appear live on the storefront.
        </p>
      </header>

      <HeroManager
        canManage={canManage}
        settings={{
          brandName: hero.brandName,
          tagline: hero.tagline,
          headline: hero.headline,
          description: hero.description,
          ctaPrimaryLabel: hero.ctaPrimaryLabel,
          ctaPrimaryHref: hero.ctaPrimaryHref,
          ctaSecondaryLabel: hero.ctaSecondaryLabel,
          ctaSecondaryHref: hero.ctaSecondaryHref,
          backgroundImage: hero.backgroundImage,
        }}
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
    </div>
  );
}
