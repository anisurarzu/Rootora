import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/common/social-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FOOTER_LINKS } from "@/constants/navigation";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="container-rootora section-padding pb-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-heading text-3xl font-bold text-primary"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-2 font-heading text-lg italic text-secondary">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                {siteConfig.contact.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {siteConfig.contact.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {siteConfig.contact.email}
              </p>
            </div>
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Support" links={FOOTER_LINKS.support} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="w-full max-w-md">
            <p className="mb-3 font-heading text-lg font-semibold text-heading">
              Join Our Community
            </p>
            <form className="flex gap-2" aria-label="Newsletter signup">
              <Input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <SocialLink href={siteConfig.links.instagram} label="Instagram">
              <InstagramIcon className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={siteConfig.links.facebook} label="Facebook">
              <FacebookIcon className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={siteConfig.links.twitter} label="Twitter">
              <TwitterIcon className="h-5 w-5" />
            </SocialLink>
            <SocialLink href={siteConfig.links.youtube} label="YouTube">
              <YoutubeIcon className="h-5 w-5" />
            </SocialLink>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p className="font-button text-xs">
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
      <h3 className="mb-4 font-button text-sm font-semibold uppercase tracking-wider text-heading">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-soft"
    >
      {children}
    </a>
  );
}
