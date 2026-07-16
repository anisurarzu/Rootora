import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { blogPosts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories about organic living, Bangladeshi food heritage, sustainable farming, and the people behind ROOTORA.",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default function BlogPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Journal"
          title="From Our Blog"
          description="Insights on organic living, heritage preservation, and the farmers who make ROOTORA possible."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-button font-semibold uppercase tracking-wider text-secondary">
                      {post.category}
                    </span>
                    <span>&middot;</span>
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {post.readTime} min
                    </span>
                  </div>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-heading transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
