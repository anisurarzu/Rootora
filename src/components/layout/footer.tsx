"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  BadgeCheck,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/common/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FOOTER_LINKS, PAYMENT_METHODS } from "@/constants/navigation";
import { siteConfig } from "@/config/site";
import { getBdYear } from "@/lib/datetime";
import { cn } from "@/lib/utils";

const DELIVERY_PARTNERS = [
  "Pathao",
  "Steadfast",
  "RedX",
  "Sundarban",
  "eCourier",
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Leaf, label: "Farm verified" },
  { icon: Truck, label: "Nationwide delivery" },
  { icon: Lock, label: "Privacy first" },
  { icon: BadgeCheck, label: "Quality assured" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="border-t border-black/[0.06] bg-white" role="contentinfo">
      {/* Brand + links */}
      <div className="container-rootora px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-block font-heading text-3xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-3 font-heading text-lg italic text-primary/80">
              {siteConfig.tagline}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              From Bangladeshi farms and artisan workshops to your home —
              honest sourcing, premium quality, and a marketplace rooted in
              care.
            </p>

            <div className="mt-8 space-y-3">
              <p className="font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Contact
              </p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="underline-offset-4 group-hover:underline">
                  {siteConfig.contact.email}
                </span>
              </a>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="underline-offset-4 group-hover:underline">
                  {siteConfig.contact.phone}
                </span>
              </a>
              <p className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {siteConfig.contact.address}
              </p>
            </div>

            <div className="mt-8">
              <p className="mb-3 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Social
              </p>
              <div className="flex items-center gap-2.5">
                <SocialLink href={siteConfig.links.instagram} label="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </SocialLink>
                <SocialLink href={siteConfig.links.facebook} label="Facebook">
                  <FacebookIcon className="h-4 w-4" />
                </SocialLink>
                <SocialLink href={siteConfig.links.twitter} label="Twitter">
                  <TwitterIcon className="h-4 w-4" />
                </SocialLink>
                <SocialLink href={siteConfig.links.youtube} label="YouTube">
                  <YoutubeIcon className="h-4 w-4" />
                </SocialLink>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:col-span-5 lg:grid-cols-3">
            <FooterColumn title="Quick Links" links={FOOTER_LINKS.quick} />
            <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
            <FooterColumn title="Customer Support" links={FOOTER_LINKS.support} />
            <FooterColumn title="Company" links={FOOTER_LINKS.company} />
            <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <p className="font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Newsletter
            </p>
            <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-heading">
              Stay close to the harvest
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Seasonal picks, farmer stories, and early access — no spam.
            </p>

            {subscribed ? (
              <p className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm font-medium text-primary">
                Thanks for joining the ROOTORA family.
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="mt-6 space-y-3"
                aria-label="Newsletter subscription"
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  required
                  className="h-11 rounded-xl border-black/[0.08] bg-[#fafaf8]"
                />
                <Button type="submit" className="h-11 w-full rounded-xl">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Trust + payments + delivery */}
      <div className="border-t border-black/[0.05] bg-[#fafaf8]">
        <div className="container-rootora px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="mb-4 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Trust badges
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-medium text-heading transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-soft"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Payment methods
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {PAYMENT_METHODS.map((method) => (
                  <li
                    key={method.id}
                    title={method.description}
                    className="rounded-lg border border-black/[0.06] bg-white px-3 py-2 font-button text-xs font-semibold tracking-wide text-heading transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary hover:shadow-soft"
                  >
                    {method.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Delivery partners
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {DELIVERY_PARTNERS.map((partner) => (
                  <li
                    key={partner}
                    className="rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary hover:shadow-soft"
                  >
                    {partner}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-black/[0.05] bg-white">
        <div className="container-rootora flex flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {getBdYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-button text-xs tracking-wide">
            Made with care in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-5 font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="group relative inline-flex text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              <span className="relative">
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] text-muted-foreground",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-white hover:shadow-soft"
      )}
    >
      {children}
    </a>
  );
}
