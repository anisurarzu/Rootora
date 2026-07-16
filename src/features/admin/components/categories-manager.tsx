"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import { FormField } from "@/features/admin/products/components/form-field";
import { SingleMediaField } from "@/features/admin/products/components/media-uploader";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/features/admin/actions/categories";
import { slugify } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  productCount: number;
  createdAt: string;
};

type CategoriesManagerProps = {
  categories: CategoryRow[];
  canManage: boolean;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  parentId: "",
};

export function CategoriesManager({
  categories,
  canManage,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(category: CategoryRow) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      parentId: category.parentId ?? "",
    });
  }

  function onSave() {
    if (!canManage) return;

    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        image: form.image,
        parentId: form.parentId || null,
      };

      const result = editingId
        ? await updateCategory(editingId, payload)
        : await createCategory(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      startCreate();
      router.refresh();
    });
  }

  const parentOptions = categories.filter((category) => category.id !== editingId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No categories yet. Create one using the form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Slug
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Products
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-heading">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {category.productCount}
                      </td>
                      <td className="px-6 py-4">
                        {canManage ? (
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => setDeleteId(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                {editingId ? "Edit category" : "Create category"}
              </CardTitle>
              <CardDescription>
                Persist category data to the catalog database.
              </CardDescription>
            </div>
            {editingId ? (
              <Button type="button" size="sm" variant="outline" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Name" htmlFor="cat-name" required>
            <Input
              id="cat-name"
              value={form.name}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                  slug: editingId
                    ? prev.slug
                    : slugify(event.target.value),
                }))
              }
            />
          </FormField>
          <FormField label="Slug" htmlFor="cat-slug" required>
            <Input
              id="cat-slug"
              value={form.slug}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Parent category">
            <Select
              value={form.parentId || "none"}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  parentId: value === "none" ? "" : value,
                }))
              }
              disabled={!canManage || pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {parentOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Description" htmlFor="cat-description">
            <Textarea
              id="cat-description"
              rows={3}
              value={form.description}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Image">
            <SingleMediaField
              label="Category image"
              value={form.image}
              onChange={(url) =>
                setForm((prev) => ({ ...prev, image: url }))
              }
            />
          </FormField>
          {canManage ? (
            <Button
              type="button"
              className="w-full"
              disabled={pending || !form.name.trim()}
              onClick={onSave}
            >
              {pending ? "Saving…" : editingId ? "Update category" : "Create category"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              View-only mode. You need categories.manage permission to edit.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete category?"
        description="This removes the category from the database if no products are linked."
        tone="danger"
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            if (!deleteId) return;
            const result = await deleteCategory(deleteId);
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
