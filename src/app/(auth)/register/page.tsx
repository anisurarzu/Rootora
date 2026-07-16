import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { RegisterForm } from "@/features/auth/components/register-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Create Account",
  description: `Join ${siteConfig.name} — organic foods and artisan lifestyle from Bangladesh.`,
};

export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="container-rootora section-padding">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <p className="font-button text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Join us
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-heading md:text-4xl">
              Create your account
            </h1>
            <p className="mt-3 text-muted-foreground">
              Shop farm-fresh products and track every order with ease.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
