import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${siteConfig.name} uses cookies and similar technologies on our website.`,
};

export default function CookiesPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Legal"
          title="Cookie Policy"
          description={`Last updated: July 1, 2026. Learn how ${siteConfig.name} uses cookies.`}
          align="left"
        />

        <div className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              What Are Cookies?
            </h2>
            <p className="mt-3 leading-relaxed">
              Cookies are small text files stored on your device when you visit
              a website. They help us remember your preferences, keep you signed
              in, and understand how you use ROOTORA so we can improve your
              experience.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Cookies We Use
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="rounded-lg border border-border bg-surface p-4">
                <p className="font-button text-sm font-semibold text-heading">
                  Essential Cookies
                </p>
                <p className="mt-1 text-sm">
                  Required for the site to function — shopping cart, wishlist,
                  and session management. Cannot be disabled.
                </p>
              </li>
              <li className="rounded-lg border border-border bg-surface p-4">
                <p className="font-button text-sm font-semibold text-heading">
                  Analytics Cookies
                </p>
                <p className="mt-1 text-sm">
                  Help us understand how visitors use ROOTORA — pages viewed,
                  products browsed, and conversion rates. Data is anonymized.
                </p>
              </li>
              <li className="rounded-lg border border-border bg-surface p-4">
                <p className="font-button text-sm font-semibold text-heading">
                  Marketing Cookies
                </p>
                <p className="mt-1 text-sm">
                  Used to deliver relevant advertisements and measure campaign
                  effectiveness. You can opt out via your browser settings.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Managing Cookies
            </h2>
            <p className="mt-3 leading-relaxed">
              You can control cookies through your browser settings. Disabling
              essential cookies may affect cart and wishlist functionality. Most
              browsers allow you to block third-party cookies while keeping
              first-party cookies enabled.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Local Storage
            </h2>
            <p className="mt-3 leading-relaxed">
              ROOTORA also uses browser local storage to persist your cart and
              wishlist between sessions. This data stays on your device and is
              not shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              More Information
            </h2>
            <p className="mt-3 leading-relaxed">
              For questions about our use of cookies, see our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              or contact {siteConfig.contact.email}.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
