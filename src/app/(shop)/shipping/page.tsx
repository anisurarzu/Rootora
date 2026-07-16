import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `Learn about ${siteConfig.name} shipping rates, delivery times, and packaging for fresh and organic products across Bangladesh.`,
};

export default function ShippingPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Delivery"
          title="Shipping Policy"
          description="Everything you need to know about how we deliver ROOTORA products to your door."
          align="left"
        />

        <div className="mx-auto max-w-3xl space-y-10">
          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Delivery Areas
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We deliver nationwide across Bangladesh, including Dhaka, Chittagong,
              Sylhet, Rajshahi, Khulna, Barisal, and Rangpur divisions. Remote
              rural areas may require additional delivery time — we will notify
              you at checkout if your location falls outside standard zones.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Delivery Times
            </h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-heading">Dhaka Metro:</strong> 1–2
                  business days
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-heading">Major Cities:</strong> 2–4
                  business days
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-heading">Other Areas:</strong> 4–7
                  business days
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-heading">Fresh Today items:</strong>{" "}
                  Same-day delivery in Dhaka when ordered before 12 PM
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Shipping Rates
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Free delivery on all orders over ৳2,000 within Dhaka. Orders below
              ৳2,000 incur a flat ৳120 delivery fee. Outside Dhaka, shipping
              rates are calculated at checkout based on weight and destination —
              typically ৳150–৳350 for standard parcels.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Packaging
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Perishable items are packed in insulated, eco-conscious packaging
              designed to maintain freshness during transit. Dry goods and
              artisan products use recyclable cardboard and minimal plastic. Gift
              hampers arrive in premium branded boxes suitable for gifting.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Order Tracking
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Once your order ships, you will receive an SMS and email with a
              tracking number. Use our{" "}
              <a href="/track-order" className="text-primary hover:underline">
                Track Order
              </a>{" "}
              page to check delivery status at any time.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
