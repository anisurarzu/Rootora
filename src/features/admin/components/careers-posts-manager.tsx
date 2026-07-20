"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import { FormField } from "@/features/admin/products/components/form-field";
import {
  createCareerPost,
  deleteCareerPost,
  updateCareerPost,
} from "@/features/careers/actions";
import { slugify } from "@/lib/utils";

export type CareerPostRow = {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  type: string | null;
  location: string | null;
  stipend: string | null;
  schedule: string | null;
  openings: number;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  alwaysOpen: boolean;
  published: boolean;
  sortOrder: number;
  applicationCount: number;
  createdAt: string;
};

type CareersPostsManagerProps = {
  posts: CareerPostRow[];
};

const emptyForm = {
  title: "",
  slug: "",
  department: "",
  type: "Part-time · Student friendly",
  location: "Remote / Dhaka",
  stipend: "৳5,000 / month",
  schedule: "4 days a week · 3–4 hours / day",
  openings: "1",
  summary: "",
  responsibilitiesText: "",
  requirementsText: "",
  alwaysOpen: true,
  published: false,
  sortOrder: "0",
};

export function CareersPostsManager({ posts }: CareersPostsManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(post: CareerPostRow) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      department: post.department ?? "",
      type: post.type ?? "",
      location: post.location ?? "",
      stipend: post.stipend ?? "",
      schedule: post.schedule ?? "",
      openings: String(post.openings),
      summary: post.summary,
      responsibilitiesText: post.responsibilities.join("\n"),
      requirementsText: post.requirements.join("\n"),
      alwaysOpen: post.alwaysOpen,
      published: post.published,
      sortOrder: String(post.sortOrder),
    });
  }

  function onSave() {
    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        department: form.department,
        type: form.type,
        location: form.location,
        stipend: form.stipend,
        schedule: form.schedule,
        openings: Number(form.openings) || 1,
        summary: form.summary,
        responsibilitiesText: form.responsibilitiesText,
        requirementsText: form.requirementsText,
        alwaysOpen: form.alwaysOpen,
        published: form.published,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const result = editingId
        ? await updateCareerPost(editingId, payload)
        : await createCareerPost(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      startCreate();
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Job posts ({posts.length})</CardTitle>
          <CardDescription>
            Published posts appear on /careers. Drafts stay admin-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No job posts yet. Create one on the right.
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-heading">{post.title}</p>
                    <Badge variant={post.published ? "default" : "outline"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {post.slug} · {post.openings} vacancy
                    {post.openings === 1 ? "" : "ies"} ·{" "}
                    {post.applicationCount} application
                    {post.applicationCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(post)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteId(post.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>
                {editingId ? "Edit job post" : "New job post"}
              </CardTitle>
              <CardDescription>
                One line per responsibility / requirement.
              </CardDescription>
            </div>
            {editingId ? (
              <Button type="button" size="sm" variant="ghost" onClick={startCreate}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                New
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Title">
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.slug || slugify(e.target.value),
                }))
              }
            />
          </FormField>
          <FormField label="Slug">
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Department">
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, department: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Type">
              <Input
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Location">
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Stipend">
              <Input
                value={form.stipend}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, stipend: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Schedule">
              <Input
                value={form.schedule}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, schedule: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Openings">
              <Input
                type="number"
                min={1}
                value={form.openings}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, openings: e.target.value }))
                }
              />
            </FormField>
          </div>
          <FormField label="Summary">
            <Textarea
              rows={3}
              value={form.summary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, summary: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Responsibilities (one per line)">
            <Textarea
              rows={4}
              value={form.responsibilitiesText}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  responsibilitiesText: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Requirements (one per line)">
            <Textarea
              rows={4}
              value={form.requirementsText}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  requirementsText: e.target.value,
                }))
              }
            />
          </FormField>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <span className="text-sm">Always open</span>
            <Switch
              checked={form.alwaysOpen}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, alwaysOpen: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <span className="text-sm">Published on /careers</span>
            <Switch
              checked={form.published}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, published: checked }))
              }
            />
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={pending || !form.title.trim() || !form.summary.trim()}
            onClick={onSave}
          >
            {pending ? "Saving…" : editingId ? "Update post" : "Create post"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete job post?"
        description="This removes the post from careers. Existing applications stay in the applications list."
        confirmLabel="Delete post"
        tone="danger"
        loading={pending}
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const result = await deleteCareerPost(deleteId);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            setDeleteId(null);
            if (editingId === deleteId) startCreate();
            router.refresh();
          });
        }}
      />
    </div>
  );
}
