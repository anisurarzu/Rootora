import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { blogPosts, getBlogBySlug } from "@/lib/mock-data";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

const articleContent: Record<
  string,
  { paragraphs: string[] }
> = {
  "farm-to-table-journey": {
    paragraphs: [
      "At ROOTORA, every product begins its journey in the fields, orchards, and workshops of Bangladesh. We work directly with verified farmers and artisans — cutting out unnecessary middlemen so that freshness is preserved and fair prices reach the people who grow and craft your food.",
      "Our supply chain is designed around transparency. When you order Sundarbans wild honey or premium Kalijira rice, you can trace it back to a specific region and, in many cases, a named farmer partner. We visit farms regularly, verify organic certifications, and ensure that harvesting practices meet our quality standards.",
      "From harvest to your doorstep, products are handled with care. Perishable items are picked at peak ripeness and shipped within 24 hours. Dry goods and artisan products are packaged in eco-conscious materials that protect quality while reflecting the premium experience ROOTORA stands for.",
      "This direct connection is more than logistics — it is a commitment to Bangladeshi agriculture. By choosing ROOTORA, you support smallholder farmers, heritage seed banks, and traditional crafts that might otherwise disappear. Every purchase is a vote for a food system that values people, planet, and provenance.",
    ],
  },
  "why-organic-matters": {
    paragraphs: [
      "Organic farming is not a marketing buzzword at ROOTORA — it is a foundational principle. In Bangladesh, where agricultural communities face increasing pressure from chemical-intensive practices, choosing organic means protecting soil health, water quality, and the long-term viability of farming livelihoods.",
      "Certified organic products are grown without synthetic pesticides, herbicides, or genetically modified organisms. For consumers, this translates to food with fewer chemical residues and richer nutritional profiles. Studies consistently show that organic produce often contains higher levels of antioxidants and beneficial compounds.",
      "The environmental case is equally compelling. Organic farms maintain biodiversity, sequester carbon in healthy soils, and reduce runoff that pollutes rivers and wetlands. In regions like the Sundarbans and Sylhet tea gardens, preserving ecological balance is essential not just for farming but for entire ecosystems.",
      "At ROOTORA, we make organic accessible without compromise. Our curated selection spans everyday staples — mustard oil, spinach, rice — and premium specialties like wild honey and heirloom mangoes. Choosing organic through ROOTORA means investing in your health and in a more sustainable Bangladesh.",
    ],
  },
  "preserving-food-heritage": {
    paragraphs: [
      "Bangladesh boasts one of the world's richest food heritages — from aromatic Kalijira rice to the legendary Langra mango, from handloom Jamdani textiles to artisan seven-layer tea. Yet many of these traditions face erosion as industrial agriculture and fast fashion reshape local economies.",
      "ROOTORA was founded on the belief that heritage is not nostalgia — it is living culture worth protecting. We partner with farmers who maintain community seed banks, preserving rice varieties that have been cultivated for generations. We work with master weavers whose Jamdani techniques are recognized by UNESCO as intangible cultural heritage.",
      "Preservation requires markets. Farmers and artisans cannot sustain traditional practices unless there is demand for their products at fair prices. ROOTORA creates that market — connecting heritage producers with customers who value authenticity, craftsmanship, and the stories behind what they buy.",
      "Every product on ROOTORA carries a piece of Bangladeshi identity. When you cook with Kalijira rice or wear a handloom saree, you participate in a chain of cultural continuity that stretches back centuries. Together, we can ensure these traditions thrive for generations to come.",
    ],
  },
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) notFound();

  const content = articleContent[slug] ?? {
    paragraphs: [
      post.excerpt,
      "At ROOTORA, we believe in connecting consumers directly with the farmers and artisans who produce Bangladesh's finest organic foods, fresh produce, and traditional crafts. Our marketplace is built on transparency, fair trade, and a deep respect for heritage.",
      "Every product in our catalog is carefully sourced and verified. We visit partner farms, review certifications, and ensure that quality standards are met at every step — from harvest to your doorstep.",
      "Thank you for being part of the ROOTORA community. Together, we are building a more sustainable, equitable food system that celebrates the best of Bangladesh.",
    ],
  };

  return (
    <MainLayout>
      <article className="container-rootora section-padding">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All Articles
        </Link>

        <header className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">
            {post.category}
          </Badge>
          <h1 className="font-heading text-3xl font-semibold text-heading md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {post.readTime} min read
            </span>
          </div>
        </header>

        <div className="relative mx-auto mt-10 aspect-[21/9] max-w-4xl overflow-hidden rounded-2xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        <div className="prose-rootora mx-auto mt-12 max-w-3xl space-y-6">
          {content.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="font-body text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </MainLayout>
  );
}
