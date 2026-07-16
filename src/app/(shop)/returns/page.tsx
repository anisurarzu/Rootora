import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Returns Policy",
  description: `Understand ${siteConfig.name} return and refund policies for organic foods, fresh produce, and artisan products.`,
};

export default function ReturnsPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Policy"
          title="Returns & Refunds"
          description="We stand behind the quality of every ROOTORA product. Here is how returns and refunds work."
          align="left"
        />

        <div className="mx-auto max-w-3xl space-y-10">
          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Non-Perishable Products
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Unopened, non-perishable items (rice, honey, spices, tea, clothing,
              gift hampers) may be returned within 7 days of delivery for a full
              refund or exchange. Items must be in original packaging and
              unused condition.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Perishable Products
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Fresh fruits, vegetables, and other perishable items cannot be
              returned once delivered. However, if you receive items that are
              damaged, spoiled, or not as described, contact us within 24 hours
              of delivery with photographs. We will arrange a replacement or
              full refund at no additional cost.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              How to Initiate a Return
            </h2>
            <ol className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-button font-semibold text-primary">1.</span>
                Email {siteConfig.contact.email} with your order number and reason
                for return.
              </li>
              <li className="flex gap-3">
                <span className="font-button font-semibold text-primary">2.</span>
                Our team will respond within 1 business day with return
                instructions.
              </li>
              <li className="flex gap-3">
                <span className="font-button font-semibold text-primary">3.</span>
                Pack items securely in original packaging and schedule a pickup
                or drop-off.
              </li>
              <li className="flex gap-3">
                <span className="font-button font-semibold text-primary">4.</span>
                Refunds are processed within 5–7 business days after we receive
                and inspect the return.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Refund Method
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Refunds are issued to the original payment method. bKash and Nagad
              refunds are processed within 3 business days. Card refunds may
              take 5–10 business days depending on your bank.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-heading">
              Non-Returnable Items
            </h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>• Opened food products (unless defective)</li>
              <li>• Custom or personalized gift hampers</li>
              <li>• Items marked as final sale</li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
