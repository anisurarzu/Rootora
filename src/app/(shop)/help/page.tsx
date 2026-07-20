import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Help Center",
  description: `Find answers to common questions about shopping, shipping, returns, and more at ${siteConfig.name}.`,
};

const helpSections = [
  {
    title: "Orders & Payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our shop, add items to your cart, and proceed to checkout. We accept major payment methods including bKash, Nagad, and credit/debit cards.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "Orders can be modified or cancelled within 2 hours of placement. Contact us at shoprootora@gmail.com with your order number.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept bKash, Nagad, Visa, Mastercard, and cash on delivery (Dhaka only, orders under ৳5,000).",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Dhaka: 1–2 business days. Other major cities: 2–4 business days. Rural areas: 4–7 business days.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes — free delivery on orders over ৳2,000 within Dhaka. A flat ৳120 fee applies to smaller orders.",
      },
      {
        q: "How are perishable items shipped?",
        a: "Fresh produce is harvested and shipped within 24 hours in insulated packaging to maintain quality.",
      },
    ],
  },
  {
    title: "Returns & Quality",
    items: [
      {
        q: "What is your return policy?",
        a: "Unopened non-perishable items can be returned within 7 days. Perishable items with quality issues are eligible for refund or replacement within 24 hours of delivery.",
      },
      {
        q: "What if my order arrives damaged?",
        a: "Photograph the damage and contact us within 24 hours. We will arrange a replacement or full refund.",
      },
    ],
  },
  {
    title: "Products & Sourcing",
    items: [
      {
        q: "Are your products really organic?",
        a: "Organic products carry certification from recognized Bangladeshi and international bodies. We verify certificates during our farm visits.",
      },
      {
        q: "Can I meet the farmers?",
        a: "Each product page links to the farmer profile when available. We also publish farmer stories on our blog and social channels.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Support"
          title="Help Center"
          description="Quick answers to the most common questions about shopping at ROOTORA."
        />

        <div className="mx-auto max-w-3xl space-y-10">
          {helpSections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-semibold text-heading">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-surface shadow-soft"
                  >
                    <summary className="cursor-pointer list-none px-6 py-4 font-button text-sm font-semibold text-heading [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {item.q}
                        <span className="text-muted-foreground transition-transform group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <div className="border-t border-border px-6 py-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <p className="font-heading text-lg font-medium text-heading">
            Still need help?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Our support team is available Sunday through Thursday, 9 AM – 6 PM
            BST.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
