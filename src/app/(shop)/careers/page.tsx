import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join the ${siteConfig.name} team — open roles in operations, technology, marketing, and farmer partnerships.`,
};

const openRoles = [
  {
    title: "Operations Manager",
    department: "Operations",
    location: "Dhaka",
    type: "Full-time",
    description:
      "Lead daily warehouse operations, inventory management, and last-mile delivery coordination across Bangladesh.",
  },
  {
    title: "Frontend Engineer",
    department: "Technology",
    location: "Dhaka / Remote",
    type: "Full-time",
    description:
      "Build beautiful, performant ecommerce experiences with Next.js, TypeScript, and modern web technologies.",
  },
  {
    title: "Farmer Partnerships Lead",
    department: "Sourcing",
    location: "Dhaka (Travel Required)",
    type: "Full-time",
    description:
      "Identify, onboard, and support organic farmers and artisans across Bangladesh. Field visits required.",
  },
  {
    title: "Content & Social Media Specialist",
    department: "Marketing",
    location: "Dhaka",
    type: "Full-time",
    description:
      "Tell ROOTORA stories through blog posts, social media, and farmer profiles. Passion for food and heritage required.",
  },
  {
    title: "Customer Support Associate",
    department: "Support",
    location: "Dhaka",
    type: "Full-time",
    description:
      "Help customers with orders, returns, and product questions via email, phone, and chat. Bengali and English fluency required.",
  },
];

export default function CareersPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Join Us"
          title="Careers at ROOTORA"
          description="Help us build the future of Bangladeshi ecommerce — connecting farmers, artisans, and conscious consumers."
        />

        <div className="mx-auto max-w-3xl space-y-6">
          {openRoles.map((role) => (
            <article
              key={role.title}
              className="rounded-xl border border-border bg-surface p-6 shadow-soft transition-all hover:shadow-lift md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-heading">
                    {role.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{role.department}</Badge>
                    <Badge variant="outline">{role.type}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {role.location}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {role.description}
              </p>
              <Button variant="ghost" size="sm" className="mt-4" asChild>
                <Link href="/contact">
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="font-heading text-xl font-semibold text-heading">
            Don&apos;t see a fit?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We are always looking for passionate people. Send your CV to{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-primary hover:underline"
            >
              {siteConfig.contact.email}
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
