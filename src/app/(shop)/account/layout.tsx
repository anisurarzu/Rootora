import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { requireSession } from "@/lib/auth-server";
import { AccountNav } from "@/features/account/components/account-nav";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your ROOTORA account, orders, and addresses.",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-4 font-heading text-lg font-semibold text-heading">
              My Account
            </h2>
            <AccountNav />
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </MainLayout>
  );
}
