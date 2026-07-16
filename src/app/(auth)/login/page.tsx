import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { LoginForm } from "@/features/auth/components/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${siteConfig.name} account.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <p className="font-button text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Welcome back
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-heading md:text-4xl">
              Sign in to ROOTORA
            </h1>
            <p className="mt-3 text-muted-foreground">
              Access your orders, wishlist, and account settings.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
              <LoginForm nextPath={next} />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to ROOTORA?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
