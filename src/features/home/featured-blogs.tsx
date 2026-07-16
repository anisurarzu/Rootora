"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { blogPosts } from "@/lib/mock-data";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";

export function FeaturedBlogs() {
  return (
    <section className="section-padding bg-background" aria-labelledby="blogs-heading">
      <div className="container-rootora">
        <SectionHeading
          eyebrow="Journal"
          title="From Our Blog"
          description="Stories about organic living, Bangladeshi heritage, and the people behind our products."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {blogPosts.map((post) => (
            <motion.article
              key={post.id}
              variants={fadeInUp}
              className="group"
            >
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
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {post.readTime} min read
                    </span>
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-semibold text-heading group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Read More
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
