"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/features/admin/products/components/confirm-dialog";
import { FormField } from "@/features/admin/products/components/form-field";
import {
  createRole,
  deleteRole,
  updateRole,
} from "@/features/admin/actions/roles";
import { groupPermissionsByModule } from "@/lib/permissions";
import { slugify } from "@/lib/utils";

export type RoleRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissionIds: string[];
  userCount: number;
};

export type PermissionRow = {
  id: string;
  key: string;
  name: string;
  module: string;
  description: string | null;
};

type RolesManagerProps = {
  roles: RoleRow[];
  permissions: PermissionRow[];
  canManage: boolean;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  permissionIds: [] as string[],
};

export function RolesManager({
  roles,
  permissions,
  canManage,
}: RolesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const grouped = useMemo(
    () => groupPermissionsByModule(permissions),
    [permissions]
  );

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(role: RoleRow) {
    setEditingId(role.id);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description ?? "",
      permissionIds: role.permissionIds,
    });
  }

  function togglePermission(permissionId: string) {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  }

  function onSave() {
    if (!canManage) {
      toast.error("You do not have permission to manage roles.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name).toUpperCase(),
        description: form.description,
        permissionIds: form.permissionIds,
      };

      const result = editingId
        ? await updateRole(editingId, payload)
        : await createRole(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      setForm(emptyForm);
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              System roles are protected. Custom roles can be edited freely.
            </CardDescription>
          </div>
          {canManage ? (
            <Button type="button" size="sm" variant="outline" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              New role
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-lg font-semibold text-heading">
                      {role.name}
                    </p>
                    <Badge variant="outline">{role.slug}</Badge>
                    {role.isSystem ? <Badge variant="secondary">System</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {role.description || "No description"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {role.permissionIds.length} permissions · {role.userCount}{" "}
                    users
                  </p>
                </div>
                {canManage ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(role)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    {!role.isSystem ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => setDeleteId(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit role" : "Create role"}
          </CardTitle>
          <CardDescription>
            Choose which permissions this role can use in the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Role name" htmlFor="role-name" required>
            <Input
              id="role-name"
              value={form.name}
              disabled={!canManage || pending}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                  slug: editingId
                    ? prev.slug
                    : slugify(event.target.value).toUpperCase(),
                }))
              }
            />
          </FormField>

          <FormField
            label="Slug"
            htmlFor="role-slug"
            hint={editingId ? "Slug cannot change after creation." : undefined}
          >
            <Input
              id="role-slug"
              value={form.slug}
              disabled={!canManage || pending || Boolean(editingId)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  slug: event.target.value.toUpperCase(),
                }))
              }
            />
          </FormField>

          <FormField label="Description" htmlFor="role-description">
            <Textarea
              id="role-description"
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

          <div className="space-y-4">
            <p className="font-button text-sm font-medium">Permissions</p>
            {Object.entries(grouped).map(([moduleName, modulePermissions]) => (
              <div
                key={moduleName}
                className="rounded-xl border border-border p-3"
              >
                <p className="mb-3 font-button text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {moduleName}
                </p>
                <div className="space-y-2">
                  {modulePermissions.map((permission) => {
                    const row = permissions.find((item) => item.key === permission.key)!;
                    return (
                      <label
                        key={row.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/40"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-input"
                          checked={form.permissionIds.includes(row.id)}
                          disabled={!canManage || pending}
                          onChange={() => togglePermission(row.id)}
                        />
                        <span>
                          <span className="block text-sm font-medium text-foreground">
                            {row.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {row.key}
                            {row.description ? ` · ${row.description}` : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {canManage ? (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={startCreate}
              >
                Clear
              </Button>
              <Button type="button" disabled={pending || !form.name.trim()} onClick={onSave}>
                {pending ? "Saving…" : editingId ? "Update role" : "Create role"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can view roles, but only admins with role management permission can edit them.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete role?"
        description="This permanently removes the custom role."
        tone="danger"
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            if (!deleteId) return;
            const result = await deleteRole(deleteId);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            setDeleteId(null);
            if (editingId === deleteId) startCreate();
            router.refresh();
          })
        }
      />
    </div>
  );
}
