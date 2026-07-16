"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, fadeInUp, viewportOnce } from "@/lib/animations";

export function NewsletterSection() {
  return (
    <section
      className="section-padding bg-surface"
      aria-labelledby="newsletter-heading"
    >
      <div className="container-rootora">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 font-button text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Stay Connected
          </p>
          <h2
            id="newsletter-heading"
            className="font-heading text-3xl font-semibold text-heading md:text-4xl"
          >
            Join the ROOTORA Family
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get seasonal recipes, farmer stories, and exclusive offers delivered
            to your inbox. No spam — just good food and good stories.
          </p>

          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            aria-label="Newsletter subscription"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              className="sm:max-w-xs"
              required
            />
            <Button type="submit" size="lg">
              Subscribe
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            By subscribing, you agree to our Privacy Policy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
