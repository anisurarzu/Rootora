import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}. Questions about orders, products, or farmer partnerships — we are here to help.`,
};

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Get in Touch"
          title="Contact Us"
          description="Have a question about an order, a product, or partnering with ROOTORA? We would love to hear from you."
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold text-heading">
                Contact Information
              </h2>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-button text-sm font-semibold">Email</p>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-button text-sm font-semibold">Phone</p>
                    {siteConfig.contact.phone ? (
                      <a
                        href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {siteConfig.contact.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Email us at {siteConfig.contact.email}
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-button text-sm font-semibold">
                      Address
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {siteConfig.contact.address}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="font-heading text-lg font-semibold text-heading">
                Business Hours
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sunday – Thursday: 9:00 AM – 6:00 PM (BST)
              </p>
              <p className="text-sm text-muted-foreground">
                Friday – Saturday: Closed
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-8">
            <h2 className="font-heading text-xl font-semibold text-heading">
              Send a Message
            </h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
