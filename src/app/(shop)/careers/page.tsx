import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sparkles, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { CareerApplyForm } from "@/features/careers/components/career-apply-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join ${siteConfig.name} — open roles managed by our team. Apply anytime.`,
};

export default async function CareersPage() {
  const posts = await prisma.careerPost.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const totalOpenings = posts.reduce((sum, post) => sum + post.openings, 0);
  const applyPositions = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
  }));

  return (
    <MainLayout>
      <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(ellipse_at_top_left,_color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%),linear-gradient(180deg,#f7f5ee_0%,#fefcf3_48%,#f3f0e6_100%)]">
        <div className="container-rootora py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-button text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Careers
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-heading md:text-5xl">
              {siteConfig.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground md:text-xl">
              Work with us. Open roles are posted here when we are hiring.
            </p>
          </div>

          {posts.length > 0 ? (
            <article className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-primary/15 bg-white/90 shadow-lift backdrop-blur-sm">
              <div className="border-b border-border bg-primary px-6 py-5 text-primary-foreground md:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-button text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                      Open roles
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold">
                      Now hiring
                    </h2>
                  </div>
                  <Badge className="border-white/25 bg-white/15 text-primary-foreground hover:bg-white/20">
                    {totalOpenings} {totalOpenings === 1 ? "vacancy" : "vacancies"}{" "}
                    open
                  </Badge>
                </div>
              </div>
              <div className="space-y-4 px-6 py-7 md:px-8">
                <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                  Browse the openings below and apply with the form. Our team
                  reviews applications on a rolling basis.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoChip
                    icon={<Users className="h-4 w-4" />}
                    label="Roles listed"
                    value={`${posts.length}`}
                  />
                  <InfoChip
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Apply"
                    value="Online form"
                  />
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </div>

      <div className="container-rootora section-padding">
        {posts.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <h2 className="font-heading text-2xl font-semibold text-heading">
              No open roles right now
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We are not hiring at the moment. Check back soon, or email{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-primary hover:underline"
              >
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-heading">
                  Open positions
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {posts.length} published role{posts.length === 1 ? "" : "s"}.
                </p>
              </div>

              {posts.map((role) => (
                <article
                  key={role.id}
                  id={role.slug}
                  className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-heading">
                        {role.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.department ? (
                          <Badge variant="outline">{role.department}</Badge>
                        ) : null}
                        {role.type ? (
                          <Badge variant="outline">{role.type}</Badge>
                        ) : null}
                        {role.stipend ? (
                          <Badge variant="outline">{role.stipend}</Badge>
                        ) : null}
                      </div>
                    </div>
                    {role.alwaysOpen ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                        Always open
                      </span>
                    ) : (
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
                        {role.openings} open
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {role.summary}
                  </p>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {role.responsibilities.length > 0 ? (
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
                    ) : null}
                    {role.requirements.length > 0 ? (
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
                    ) : null}
                  </div>

                  {(role.schedule || role.location) && (
                    <p className="mt-5 text-xs text-muted-foreground">
                      {[role.schedule, role.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-7">
                <h2 className="font-heading text-2xl font-semibold text-heading">
                  Apply now
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applications are saved to our database for the ROOTORA team.
                </p>
                <div className="mt-6">
                  <CareerApplyForm positions={applyPositions} />
                </div>
              </div>
            </div>
          </div>
        )}
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
