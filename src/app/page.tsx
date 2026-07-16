import { MainLayout } from "@/components/layout/main-layout";
import { FeaturedBlogs } from "@/features/home/featured-blogs";
import { FeaturedCategories } from "@/features/home/featured-categories";
import { FarmerStories } from "@/features/home/farmer-stories";
import { getHeroContent } from "@/features/home/hero";
import { HeroSection } from "@/features/home/hero-section";
import { InstagramGallery } from "@/features/home/instagram-gallery";
import { NewsletterSection } from "@/features/home/newsletter-section";
import { OrganicCollectionBanner } from "@/features/home/organic-collection-banner";
import { ProductShowcase } from "@/features/home/product-showcase";
import { RecipeSection } from "@/features/home/recipe-section";
import { Testimonials } from "@/features/home/testimonials";
import { TraditionalClothing } from "@/features/home/traditional-clothing";
import {
  getBestSellers,
  getFreshToday,
  getOrganicProducts,
  getSeasonalProducts,
} from "@/lib/mock-data";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    heroContent,
    seasonalProducts,
    freshToday,
    bestSellers,
    organicProducts,
  ] = await Promise.all([
    getHeroContent(),
    Promise.resolve(getSeasonalProducts()),
    Promise.resolve(getFreshToday()),
    Promise.resolve(getBestSellers()),
    Promise.resolve(getOrganicProducts().slice(0, 4)),
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

      <HeroSection content={heroContent} />
      <FeaturedCategories />

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

      {freshToday.length > 0 && (
        <ProductShowcase
          id="fresh-today"
          eyebrow="Fresh Today"
          title="Harvested This Morning"
          description="Farm-fresh produce delivered within hours of harvest."
          products={freshToday}
          viewAllHref="/shop?filter=fresh-today"
        />
      )}

      <ProductShowcase
        id="best-sellers"
        eyebrow="Popular"
        title="Best Sellers"
        description="Community favorites loved by thousands of customers."
        products={bestSellers}
        viewAllHref="/shop?sort=popular"
      />

      <OrganicCollectionBanner />

      <ProductShowcase
        id="organic"
        eyebrow="Organic"
        title="Organic Collection"
        description="Certified organic products from trusted Bangladeshi farms."
        products={organicProducts}
        viewAllHref="/collections/organic"
      />

      <TraditionalClothing />
      <FarmerStories />
      <RecipeSection />
      <FeaturedBlogs />
      <Testimonials />
      <NewsletterSection />
      <InstagramGallery />
    </MainLayout>
  );
}
