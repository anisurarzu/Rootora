"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  updateHeroSlide,
} from "@/features/admin/actions/hero";

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

export function HeroManager({ slides, canManage }: HeroManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState(emptySlide);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    if (!slideForm.image.trim()) {
      toast.error("Please upload a campaign image before saving");
      return;
    }
    if (!slideForm.href.trim()) {
      toast.error("Link is required");
      return;
    }
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
    const idToDelete = deleteId;
    startTransition(async () => {
      const result = await deleteHeroSlide(idToDelete);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (editingId === idToDelete) {
        setEditingId(null);
        setSlideForm(emptySlide);
      }
      setDeleteId(null);
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Hero slider</CardTitle>
            <CardDescription>
              Homepage hero shows these campaign banners only. Upload image +
              link. Deleting a slide also removes its image from Cloudinary.
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
              <FormField label="Label (optional)" className="sm:col-span-1">
                <Input
                  value={slideForm.label}
                  placeholder="Flash Sale"
                  onChange={(e) =>
                    setSlideForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Title (optional)">
                <Input
                  value={slideForm.title}
                  placeholder="Campaign title"
                  onChange={(e) =>
                    setSlideForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Detail (optional)" className="sm:col-span-2">
                <Input
                  value={slideForm.detail}
                  placeholder="Short description"
                  onChange={(e) =>
                    setSlideForm((prev) => ({
                      ...prev,
                      detail: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Link (required)">
                <Input
                  value={slideForm.href}
                  placeholder="/shop"
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
              <FormField label="Image (required)" className="sm:col-span-2">
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

          {slides.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              No campaign slides yet. Add one to show banners on the homepage.
            </p>
          ) : (
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
                        disabled={pending}
                        onClick={() => startEditSlide(slide)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => setDeleteId(slide.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !pending && setDeleteId(null)}
        title="Delete hero slide?"
        description="This banner will be removed from the homepage and its image deleted from Cloudinary."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={onDelete}
        loading={pending}
      />
    </div>
  );
}
