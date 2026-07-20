import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  Clock3,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { CareerApplyForm } from "@/features/careers/components/career-apply-form";
import {
  CAREER_POSITIONS,
  TOTAL_OPENINGS,
} from "@/features/careers/positions";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join ${siteConfig.name} — part-time student roles for social media and customer messaging. Always open. ৳5,000/month.`,
};

export default function CareersPage() {
  return (
    <MainLayout>
      <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(ellipse_at_top_left,_color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%),linear-gradient(180deg,#f7f5ee_0%,#fefcf3_48%,#f3f0e6_100%)]">
        <div className="container-rootora py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-button text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Careers · Always hiring
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-heading md:text-5xl">
              {siteConfig.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground md:text-xl">
              Part-time openings for students who can help maintain our social
              pages and reply to customer messages.
            </p>
          </div>

          <article className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-primary/15 bg-white/90 shadow-lift backdrop-blur-sm">
            <div className="border-b border-border bg-primary px-6 py-5 text-primary-foreground md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                    Official circular
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold">
                    Student Part-Time Roles
                  </h2>
                </div>
                <Badge className="border-white/25 bg-white/15 text-primary-foreground hover:bg-white/20">
                  {TOTAL_OPENINGS} positions open
                </Badge>
              </div>
            </div>

            <div className="space-y-6 px-6 py-7 md:px-8 md:py-8">
              <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                ROOTORA is looking for sincere, student-friendly teammates to
                support day-to-day Facebook & Instagram page maintenance and
                customer message replies. These roles stay open — apply anytime.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoChip
                  icon={<Wallet className="h-4 w-4" />}
                  label="Monthly stipend"
                  value="৳5,000 BDT"
                />
                <InfoChip
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Time commitment"
                  value="4 days / week · 3–4 hours"
                />
                <InfoChip
                  icon={<Users className="h-4 w-4" />}
                  label="Who can apply"
                  value="Students & freshers"
                />
                <InfoChip
                  icon={<MapPin className="h-4 w-4" />}
                  label="Work mode"
                  value="Remote / Dhaka"
                />
              </div>

              <div className="rounded-xl border border-dashed border-primary/25 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Always open
                </span>
                <span className="mx-2 text-border">·</span>
                Applications are reviewed on a rolling basis. Selected
                candidates will be contacted by phone or email.
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="container-rootora section-padding">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-heading">
                Open positions
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Two part-time seats. Same stipend and schedule for both.
              </p>
            </div>

            {CAREER_POSITIONS.map((role) => (
              <article
                key={role.slug}
                id={role.slug}
                className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-heading">
                      {role.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{role.department}</Badge>
                      <Badge variant="outline">{role.type}</Badge>
                      <Badge variant="outline">{role.stipend}</Badge>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    Always open
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {role.summary}
                </p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="font-button text-xs font-semibold uppercase tracking-wide text-heading">
                      You will
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {role.responsibilities.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-button text-xs font-semibold uppercase tracking-wide text-heading">
                      Looking for
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {role.requirements.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-5 text-xs text-muted-foreground">
                  {role.schedule} · {role.location}
                </p>
              </article>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-7">
              <h2 className="font-heading text-2xl font-semibold text-heading">
                Apply now
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in your details. Applications are saved to our database and
                reviewed by the ROOTORA team.
              </p>
              <div className="mt-6">
                <CareerApplyForm positions={CAREER_POSITIONS} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-3.5 py-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-heading">{value}</p>
      </div>
    </div>
  );
}
