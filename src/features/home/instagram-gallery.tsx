"use client";

import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/common/social-icons";
import { SectionHeading } from "@/components/common/section-heading";
import { instagramPosts } from "@/lib/mock-data";
import { siteConfig } from "@/config/site";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";

export function InstagramGallery() {
  return (
    <section className="section-padding bg-background" aria-labelledby="instagram-heading">
      <div className="container-rootora">
        <SectionHeading
          eyebrow="Follow Us"
          title="Life at ROOTORA"
          description="Daily inspiration from our farms, kitchens, and community."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-3"
        >
          {instagramPosts.map((post, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-lg"
                aria-label={`Instagram post ${index + 1}`}
              >
                <Image
                  src={post}
                  alt={`ROOTORA lifestyle ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/0 transition-colors group-hover:bg-primary/40">
                  <InstagramIcon className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center">
          <Link
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-button text-sm font-medium text-primary hover:underline"
          >
            <InstagramIcon className="h-4 w-4" />
            @shoprootora on Instagram
          </Link>
        </p>
      </div>
    </section>
  );
}
