"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { testimonials } from "@/lib/mock-data";
import {
  fadeInUp,
  motion,
  staggerContainer,
  viewportOnce,
} from "@/lib/animations";

export function Testimonials() {
  return (
    <section className="section-padding bg-primary text-primary-foreground" aria-labelledby="testimonials-heading">
      <div className="container-rootora">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by Our Community"
          description="Hear from customers who trust ROOTORA for their daily essentials and special occasions."
          className="[&_h2]:text-primary-foreground [&_p]:text-primary-foreground/70 [&_p:first-of-type]:text-accent"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.blockquote
              key={testimonial.id}
              variants={fadeInUp}
              className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm md:p-8"
            >
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>

              <p className="mt-4 text-base leading-relaxed text-primary-foreground/90">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              <footer className="mt-6 flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
                <div>
                  <cite className="not-italic font-button font-semibold text-primary-foreground">
                    {testimonial.name}
                  </cite>
                  <p className="text-sm text-primary-foreground/60">
                    {testimonial.location}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
