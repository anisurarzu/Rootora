import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about shopping, shipping, returns, and products at ${siteConfig.name}.`,
};

const faqs = [
  {
    q: "What is ROOTORA?",
    a: "ROOTORA is a premium Bangladeshi ecommerce marketplace connecting consumers directly with local farmers and artisans. We offer organic foods, fresh produce, traditional clothing, and handmade crafts.",
  },
  {
    q: "Are all products organic?",
    a: "Not all products are organic, but every organic item is clearly labeled with certification details. We also carry artisan, heritage, and seasonal products that may not carry organic certification.",
  },
  {
    q: "How fresh are your fruits and vegetables?",
    a: "Items marked 'Fresh Today' are harvested the same day and shipped within 24 hours. Other produce is sourced at peak ripeness and delivered within 1–2 days in Dhaka.",
  },
  {
    q: "Do you ship outside Dhaka?",
    a: "Yes, we deliver nationwide across Bangladesh. Delivery times vary by location — typically 2–4 days for major cities and 4–7 days for rural areas.",
  },
  {
    q: "What is the minimum order for free delivery?",
    a: "Free delivery is available on orders over ৳2,000 within Dhaka. Outside Dhaka, shipping rates are calculated at checkout.",
  },
  {
    q: "Can I return a product?",
    a: "Non-perishable, unopened items can be returned within 7 days. Perishable items with quality issues are eligible for refund or replacement within 24 hours of delivery.",
  },
  {
    q: "How do I contact customer support?",
    a: `Email us at ${siteConfig.contact.email} or use the contact form on our website. We respond within 1–2 business days.`,
  },
  {
    q: "Do you offer gift wrapping?",
    a: "Yes — gift hampers and selected products arrive in premium branded packaging. You can add a gift message at checkout (coming soon).",
  },
  {
    q: "How do I become a ROOTORA farmer partner?",
    a: "Farmers and artisans producing organic, heritage, or handmade goods can apply via our contact page. We review applications and visit farms before onboarding.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. All payments are processed through PCI-compliant gateways. ROOTORA never stores your full card details on our servers.",
  },
];

export default function FaqsPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Support"
          title="Frequently Asked Questions"
          description="Quick answers to common questions about ROOTORA."
        />

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-surface shadow-soft"
            >
              <summary className="cursor-pointer list-none px-6 py-4 font-button text-sm font-semibold text-heading [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <div className="border-t border-border px-6 py-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="text-muted-foreground">
            Did not find what you are looking for?
          </p>
          <Link
            href="/help"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            Visit our Help Center
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
