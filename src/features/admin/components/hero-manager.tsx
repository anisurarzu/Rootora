"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
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
import { FormField } from "@/features/admin/products/components/form-field";
import { SingleMediaField } from "@/features/admin/products/components/media-uploader";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import {
  createHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  updateHeroSettings,
  updateHeroSlide,
} from "@/features/admin/actions/hero";

export type HeroSettingsForm = {
  brandName: string;
  tagline: string;
  headline: string;
  description: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  backgroundImage: string;
};

export type HeroSlideRow = {
  id: string;
  image: string;
  label: string;
  title: string;
  detail: string;
  href: string;
  sortOrder: number;
  active: boolean;
};

type HeroManagerProps = {
  settings: HeroSettingsForm;
  slides: HeroSlideRow[];
  canManage: boolean;
};

const emptySlide = {
  image: "",
  label: "Latest offer",
  title: "",
  detail: "",
  href: "/shop",
  active: true,
};

export function HeroManager({ settings, slides, canManage }: HeroManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(settings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState(emptySlide);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function saveSettings() {
    if (!canManage) return;
    startTransition(async () => {
      const result = await updateHeroSettings(form);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function startCreateSlide() {
    setEditingId(null);
    setSlideForm(emptySlide);
  }

  function startEditSlide(slide: HeroSlideRow) {
    setEditingId(slide.id);
    setSlideForm({
      image: slide.image,
      label: slide.label,
      title: slide.title,
      detail: slide.detail,
      href: slide.href,
      active: slide.active,
    });
  }

  function saveSlide() {
    if (!canManage) return;
    startTransition(async () => {
      const result = editingId
        ? await updateHeroSlide(editingId, slideForm)
        : await createHeroSlide(slideForm);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setEditingId(null);
      setSlideForm(emptySlide);
      router.refresh();
    });
  }

  function moveSlide(id: string, direction: -1 | 1) {
    if (!canManage) return;
    const index = slides.findIndex((slide) => slide.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= slides.length) return;

    const ordered = [...slides];
    const [item] = ordered.splice(index, 1);
    ordered.splice(target, 0, item!);

    startTransition(async () => {
      const result = await reorderHeroSlides(ordered.map((slide) => slide.id));
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function onDelete() {
    if (!deleteId || !canManage) return;
    startTransition(async () => {
      const result = await deleteHeroSlide(deleteId);
      setDeleteId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero content</CardTitle>
          <CardDescription>
            Left side text, buttons, and full background image for the homepage
            hero.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Brand name">
            <Input
              value={form.brandName}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, brandName: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Tagline">
            <Input
              value={form.tagline}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tagline: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Headline" className="sm:col-span-2">
            <Input
              value={form.headline}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, headline: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={form.description}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Primary CTA label">
            <Input
              value={form.ctaPrimaryLabel}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ctaPrimaryLabel: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Primary CTA link">
            <Input
              value={form.ctaPrimaryHref}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ctaPrimaryHref: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Secondary CTA label">
            <Input
              value={form.ctaSecondaryLabel}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ctaSecondaryLabel: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Secondary CTA link">
            <Input
              value={form.ctaSecondaryHref}
              disabled={!canManage || pending}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ctaSecondaryHref: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Background image" className="sm:col-span-2">
            <SingleMediaField
              value={form.backgroundImage}
              onChange={(url) =>
                setForm((prev) => ({ ...prev, backgroundImage: url }))
              }
            />
          </FormField>
          {canManage ? (
            <div className="sm:col-span-2">
              <Button onClick={saveSettings} disabled={pending}>
                {pending ? "Saving…" : "Save hero content"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Campaign slider</CardTitle>
            <CardDescription>
              Active slides appear in the homepage hero carousel. Upload
              Daraz-style campaign banners, set the link, and toggle Active to
              show or hide each slide on the live storefront.
            </CardDescription>
          </div>
          {canManage ? (
            <Button size="sm" variant="outline" onClick={startCreateSlide}>
              <Plus className="h-4 w-4" />
              Add slide
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {canManage ? (
            <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
              <FormField label="Label" className="sm:col-span-1">
                <Input
                  value={slideForm.label}
                  onChange={(e) =>
                    setSlideForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Title">
                <Input
                  value={slideForm.title}
                  onChange={(e) =>
                    setSlideForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Detail" className="sm:col-span-2">
                <Input
                  value={slideForm.detail}
                  onChange={(e) =>
                    setSlideForm((prev) => ({
                      ...prev,
                      detail: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Link">
                <Input
                  value={slideForm.href}
                  onChange={(e) =>
                    setSlideForm((prev) => ({ ...prev, href: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Active">
                <div className="flex h-11 items-center gap-3">
                  <Switch
                    checked={slideForm.active}
                    onCheckedChange={(checked) =>
                      setSlideForm((prev) => ({ ...prev, active: checked }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Show on homepage
                  </span>
                </div>
              </FormField>
              <FormField label="Image" className="sm:col-span-2">
                <SingleMediaField
                  value={slideForm.image}
                  onChange={(url) =>
                    setSlideForm((prev) => ({ ...prev, image: url }))
                  }
                />
              </FormField>
              <div className="flex gap-2 sm:col-span-2">
                <Button onClick={saveSlide} disabled={pending}>
                  {editingId ? "Update slide" : "Add slide"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={startCreateSlide}
                  >
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <ul className="space-y-3">
            {slides.map((slide, index) => (
              <li
                key={slide.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div
                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {slide.label}
                    {!slide.active ? " · Hidden" : ""}
                  </p>
                  <p className="font-medium text-heading">{slide.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {slide.detail} · {slide.href}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending || index === 0}
                      onClick={() => moveSlide(slide.id, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending || index === slides.length - 1}
                      onClick={() => moveSlide(slide.id, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditSlide(slide)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(slide.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete hero slide?"
        description="This offer card will be removed from the homepage hero."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={onDelete}
        loading={pending}
      />
    </div>
  );
}
