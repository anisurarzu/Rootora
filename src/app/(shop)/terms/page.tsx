import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using the ${siteConfig.name} ecommerce platform.`,
};

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Legal"
          title="Terms of Service"
          description={`Last updated: July 1, 2026. By using ${siteConfig.name}, you agree to these terms.`}
          align="left"
        />

        <div className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Acceptance of Terms
            </h2>
            <p className="mt-3 leading-relaxed">
              By accessing or using the ROOTORA website and services, you agree
              to be bound by these Terms of Service. If you do not agree, please
              do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Products & Pricing
            </h2>
            <p className="mt-3 leading-relaxed">
              All product descriptions, images, and prices are subject to change
              without notice. We strive for accuracy but do not guarantee that
              product descriptions or pricing are error-free. ROOTORA reserves
              the right to cancel orders placed at incorrect prices.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Orders & Payment
            </h2>
            <p className="mt-3 leading-relaxed">
              Placing an order constitutes an offer to purchase. We reserve the
              right to accept or decline any order. Payment must be received
              before orders are processed. Accepted payment methods are listed at
              checkout.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Intellectual Property
            </h2>
            <p className="mt-3 leading-relaxed">
              All content on the ROOTORA website — including text, images, logos,
              and design — is the property of ROOTORA or its licensors and is
              protected by copyright and trademark laws. Unauthorized use is
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Limitation of Liability
            </h2>
            <p className="mt-3 leading-relaxed">
              ROOTORA is not liable for indirect, incidental, or consequential
              damages arising from your use of our services. Our total liability
              for any claim shall not exceed the amount you paid for the
              relevant order.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Governing Law
            </h2>
            <p className="mt-3 leading-relaxed">
              These terms are governed by the laws of Bangladesh. Any disputes
              shall be resolved in the courts of Dhaka, Bangladesh.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed">
              Questions about these terms? Contact us at{" "}
              {siteConfig.contact.email}.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
