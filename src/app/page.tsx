import { MainLayout } from "@/components/layout/main-layout";
import { FeaturedCategories } from "@/features/home/featured-categories";
import { getFlashSaleContent } from "@/features/home/flash-sale";
import { getHeroContent } from "@/features/home/hero";
import { HeroSection } from "@/features/home/hero-section";
import { InstagramGallery } from "@/features/home/instagram-gallery";
import { NewsletterSection } from "@/features/home/newsletter-section";
import { OrganicCollectionBanner } from "@/features/home/organic-collection-banner";
import { ProductShowcase } from "@/features/home/product-showcase";
import { PromoStripBanner } from "@/features/home/promo-strip-banner";
import { Testimonials } from "@/features/home/testimonials";
import { TraditionalClothing } from "@/features/home/traditional-clothing";
import {
  getStorefrontCategories,
  getStorefrontProducts,
  getStorefrontProductsByFlag,
} from "@/features/products/storefront-queries";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    heroContent,
    flashSale,
    categories,
    seasonalProducts,
    bestSellers,
    allProducts,
    organicProducts,
  ] = await Promise.all([
    getHeroContent(),
    getFlashSaleContent(),
    getStorefrontCategories({ onlyWithProducts: true }),
    getStorefrontProductsByFlag("seasonal"),
    getStorefrontProductsByFlag("bestSeller"),
    getStorefrontProducts(),
    getStorefrontProductsByFlag("organic", 4),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSection content={heroContent} flashSale={flashSale} />
      <FeaturedCategories categories={categories} />

      {bestSellers.length > 0 && (
        <ProductShowcase
          id="best-sellers"
          eyebrow="Popular"
          title="Best Sellers"
          products={bestSellers}
          viewAllHref="/shop?sort=popular"
          compact
        />
      )}

      <PromoStripBanner />

      {allProducts.length > 0 && (
        <ProductShowcase
          id="all-products"
          eyebrow="Shop"
          title="Just For You"
          products={allProducts}
          viewAllHref="/shop"
          compact
        />
      )}

      {seasonalProducts.length > 0 && (
        <ProductShowcase
          id="seasonal"
          eyebrow="Seasonal"
          title="Seasonal Picks"
          description="Limited-time offerings at the peak of their season."
          products={seasonalProducts}
          viewAllHref="/collections/seasonal"
        />
      )}

      <OrganicCollectionBanner />

      {organicProducts.length > 0 && (
        <ProductShowcase
          id="organic"
          eyebrow="Organic"
          title="Organic Collection"
          description="Pure forest honey and cold-pressed mustard oil from trusted Bangladeshi farms."
          products={organicProducts}
          viewAllHref="/collections/organic"
        />
      )}

      <TraditionalClothing />
      <Testimonials />
      <NewsletterSection />
      <InstagramGallery />
    </MainLayout>
  );
}
