import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeading } from "@/components/common/section-heading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <SectionHeading
          eyebrow="Legal"
          title="Privacy Policy"
          description={`Last updated: July 1, 2026. This policy describes how ${siteConfig.name} handles your data.`}
          align="left"
        />

        <div className="mx-auto max-w-3xl space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Information We Collect
            </h2>
            <p className="mt-3 leading-relaxed">
              When you create an account, place an order, or contact us, we
              collect information such as your name, email address, phone
              number, delivery address, and payment details. We also collect
              browsing data through cookies to improve your shopping experience.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              How We Use Your Information
            </h2>
            <p className="mt-3 leading-relaxed">
              We use your data to process orders, communicate delivery updates,
              provide customer support, and send marketing communications (with
              your consent). We do not sell your personal information to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Data Sharing
            </h2>
            <p className="mt-3 leading-relaxed">
              We share necessary information with delivery partners and payment
              processors to fulfill your orders. All third-party partners are
              contractually required to protect your data and use it only for
              the services they provide to ROOTORA.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Data Security
            </h2>
            <p className="mt-3 leading-relaxed">
              We implement industry-standard security measures including SSL
              encryption, secure payment processing, and access controls to
              protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Your Rights
            </h2>
            <p className="mt-3 leading-relaxed">
              You may request access to, correction of, or deletion of your
              personal data at any time by contacting{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-primary hover:underline"
              >
                {siteConfig.contact.email}
              </a>
              . You may also opt out of marketing emails using the unsubscribe
              link in any promotional message.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-heading">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed">
              For privacy-related inquiries, contact our Data Protection Officer
              at {siteConfig.contact.email}.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
