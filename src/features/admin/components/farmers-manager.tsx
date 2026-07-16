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
  MediaUploader,
  SingleMediaField,
} from "@/features/admin/products/components/media-uploader";
import {
  createFarmer,
  deleteFarmer,
  updateFarmer,
} from "@/features/admin/actions/farmers";
import { slugify } from "@/lib/utils";

export type FarmerRow = {
  id: string;
  name: string;
  slug: string;
  village: string;
  district: string;
  story: string;
  image: string | null;
  gallery: string[];
  verified: boolean;
  productCount: number;
};

type FarmersManagerProps = {
  farmers: FarmerRow[];
  canManage: boolean;
};

const emptyForm = {
  name: "",
  slug: "",
  village: "",
  district: "",
  story: "",
  image: "",
  gallery: [] as string[],
  verified: false,
};

export function FarmersManager({ farmers, canManage }: FarmersManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(farmer: FarmerRow) {
    setEditingId(farmer.id);
    setForm({
      name: farmer.name,
      slug: farmer.slug,
      village: farmer.village,
      district: farmer.district,
      story: farmer.story,
      image: farmer.image ?? "",
      gallery: farmer.gallery,
      verified: farmer.verified,
    });
  }

  function onSave() {
    if (!canManage) return;

    startTransition(async () => {
      const payload = { ...form };
      const result = editingId
        ? await updateFarmer(editingId, payload)
        : await createFarmer(payload);

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
          <CardTitle>Farmers ({farmers.length})</CardTitle>
          <CardDescription>
            Linked to products and the public farmers directory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {farmers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No farmers yet.</p>
          ) : (
            farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-lg font-semibold text-heading">
                        {farmer.name}
                      </p>
                      {farmer.verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {farmer.village}, {farmer.district} ·{" "}
                      {farmer.productCount} products
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(farmer)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => setDeleteId(farmer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle>{editingId ? "Edit farmer" : "Add farmer"}</CardTitle>
            <CardDescription>Saved directly to the database.</CardDescription>
          </div>
          {editingId ? (
            <Button type="button" size="sm" variant="outline" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Name" required>
            <Input
              value={form.name}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                  slug: editingId ? prev.slug : slugify(event.target.value),
                }))
              }
            />
          </FormField>
          <FormField label="Slug" required>
            <Input
              value={form.slug}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Village" required>
              <Input
                value={form.village}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, village: event.target.value }))
                }
              />
            </FormField>
            <FormField label="District" required>
              <Input
                value={form.district}
                disabled={!canManage || pending}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, district: event.target.value }))
                }
              />
            </FormField>
          </div>
          <FormField label="Story" required>
            <Textarea
              rows={5}
              value={form.story}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, story: event.target.value }))
              }
            />
          </FormField>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
            <span className="font-button text-sm">Verified farmer</span>
            <Switch
              checked={form.verified}
              disabled={!canManage || pending}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, verified: checked }))
              }
            />
          </div>
          <FormField label="Profile image">
            <SingleMediaField
              value={form.image}
              onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
            />
          </FormField>
          <FormField label="Gallery">
            <MediaUploader
              value={form.gallery}
              onChange={(urls) => setForm((prev) => ({ ...prev, gallery: urls }))}
              maxFiles={8}
            />
          </FormField>
          {canManage ? (
            <Button
              type="button"
              className="w-full"
              disabled={pending}
              onClick={onSave}
            >
              {pending ? "Saving…" : editingId ? "Update farmer" : "Create farmer"}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete farmer?"
        description="This permanently removes the farmer if no products are linked."
        tone="danger"
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            if (!deleteId) return;
            const result = await deleteFarmer(deleteId);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            if (editingId === deleteId) startCreate();
            setDeleteId(null);
            router.refresh();
          })
        }
      />
    </div>
  );
}
