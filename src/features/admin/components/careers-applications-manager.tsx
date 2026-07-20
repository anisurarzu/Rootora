"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import {
  deleteCareerApplication,
  updateCareerApplicationStatus,
} from "@/features/careers/actions";
import { cn } from "@/lib/utils";

export type AdminCareerApplication = {
  id: string;
  positionSlug: string;
  positionTitle: string;
  fullName: string;
  email: string;
  phone: string;
  city: string | null;
  education: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  about: string;
  availability: string | null;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  "NEW",
  "REVIEWED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
] as const;

type CareersApplicationsManagerProps = {
  applications: AdminCareerApplication[];
};

export function CareersApplicationsManager({
  applications,
}: CareersApplicationsManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(applications[0]?.id ?? "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  const selected =
    filtered.find((app) => app.id === selectedId) ??
    filtered[0] ??
    null;

  function updateStatus(id: string, status: string) {
    startTransition(async () => {
      const result = await updateCareerApplicationStatus(id, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Status updated");
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteCareerApplication(deleteId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Application deleted");
      setDeleteId(null);
      if (selectedId === deleteId) {
        setSelectedId("");
      }
      router.refresh();
    });
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
        No career applications yet. When someone applies on /careers, they will
        show up here.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["ALL", ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {status === "ALL" ? "All" : status.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid min-h-[28rem] overflow-hidden rounded-xl border border-border bg-white lg:grid-cols-[22rem_1fr]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <ul className="max-h-[40vh] overflow-y-auto lg:max-h-[70vh]">
            {filtered.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                No applications in this filter
              </li>
            ) : (
              filtered.map((app) => (
                <li key={app.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(app.id)}
                    className={cn(
                      "block w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                      selected?.id === app.id && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-heading">
                        {app.fullName}
                      </p>
                      <StatusPill status={app.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {app.positionTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDate(app.createdAt)}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <section className="p-5 md:p-6">
          {!selected ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Select an application to review
            </p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-heading">
                    {selected.fullName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Applied for {selected.positionTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selected.status}
                    disabled={pending}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteId(selected.id)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" value={selected.email} href={`mailto:${selected.email}`} />
                <Field label="Phone" value={selected.phone} href={`tel:${selected.phone}`} />
                <Field label="City" value={selected.city || "—"} />
                <Field label="Education" value={selected.education || "—"} />
                <Field
                  label="Facebook"
                  value={selected.facebookUrl || "—"}
                  href={selected.facebookUrl || undefined}
                />
                <Field
                  label="Instagram"
                  value={selected.instagramUrl || "—"}
                  href={selected.instagramUrl || undefined}
                />
                <Field
                  label="Availability"
                  value={selected.availability || "—"}
                  className="sm:col-span-2"
                />
              </dl>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  About / fit
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed text-heading">
                  {selected.about}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete application?"
        description="This permanently removes the career application from the database."
        confirmLabel="Delete application"
        tone="danger"
        loading={pending}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function Field({
  label,
  value,
  href,
  className,
}: {
  label: string;
  value: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-all text-sm text-heading">
        {href && value !== "—" ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-sky-100 text-sky-800",
    REVIEWED: "bg-amber-100 text-amber-800",
    SHORTLISTED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    HIRED: "bg-primary/15 text-primary",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
