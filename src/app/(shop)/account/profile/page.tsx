import type { Metadata } from "next";
import { ProfileForm } from "@/features/account/components/profile-form";
import { requireSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile",
  description: "Update your ROOTORA account profile.",
};

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, email: true, image: true },
  });

  const name = user?.name ?? session.user.name ?? "";
  const email = user?.email ?? session.user.email ?? "";
  const phone = user?.phone ?? "";
  const image = user?.image ?? null;

  return (
    <div className="profile-page space-y-8">
      <header className="profile-hero relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-8 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 0% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 50%)",
          }}
        />
        <div className="relative">
          <p className="font-button text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Account
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-heading sm:text-4xl">
            Profile
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Keep your photo and contact details up to date for smoother
            checkout and order updates.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="profile-details-heading"
        className="profile-panel rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8"
      >
        <div className="mb-8">
          <h2
            id="profile-details-heading"
            className="font-heading text-xl font-semibold text-heading"
          >
            Personal details
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your photo appears in the account menu across the store.
          </p>
        </div>

        <ProfileForm
          name={name}
          email={email}
          phone={phone}
          image={image}
        />
      </section>
    </div>
  );
}
