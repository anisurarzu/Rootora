"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/features/admin/products/components/form-field";
import {
  setCustomerBanned,
  updateCustomerProfile,
  updateCustomerRole,
} from "@/features/admin/actions/customers";

type RoleOption = { id: string; name: string; slug: string };

type CustomerActionsProps = {
  userId: string;
  name: string;
  phone: string | null;
  role: string;
  banned: boolean;
  roles: RoleOption[];
  canManage: boolean;
};

export function CustomerActions({
  userId,
  name,
  phone,
  role,
  banned,
  roles,
  canManage,
}: CustomerActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formName, setFormName] = useState(name);
  const [formPhone, setFormPhone] = useState(phone ?? "");
  const [formRole, setFormRole] = useState(role);
  const [banReason, setBanReason] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" required>
          <Input
            value={formName}
            disabled={!canManage || pending}
            onChange={(event) => setFormName(event.target.value)}
          />
        </FormField>
        <FormField label="Phone">
          <Input
            value={formPhone}
            disabled={!canManage || pending}
            onChange={(event) => setFormPhone(event.target.value)}
          />
        </FormField>
      </div>

      <Button
        type="button"
        disabled={!canManage || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateCustomerProfile({
              userId,
              name: formName,
              phone: formPhone,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message);
            router.refresh();
          })
        }
      >
        Save profile
      </Button>

      <div className="space-y-2">
        <FormField label="Role">
          <div className="flex gap-2">
            <Select
              value={formRole}
              onValueChange={setFormRole}
              disabled={!canManage || pending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((item) => (
                  <SelectItem key={item.id} value={item.slug}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={!canManage || pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await updateCustomerRole({
                    userId,
                    role: formRole,
                  });
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                })
              }
            >
              Update role
            </Button>
          </div>
        </FormField>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="font-button text-sm font-medium">
          Account status: {banned ? "Banned" : "Active"}
        </p>
        {!banned ? (
          <div className="mt-3 space-y-3">
            <Input
              placeholder="Ban reason"
              value={banReason}
              disabled={!canManage || pending}
              onChange={(event) => setBanReason(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="text-red-600"
              disabled={!canManage || pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await setCustomerBanned({
                    userId,
                    banned: true,
                    banReason,
                  });
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                })
              }
            >
              Ban customer
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="mt-3"
            disabled={!canManage || pending}
            onClick={() =>
              startTransition(async () => {
                const result = await setCustomerBanned({
                  userId,
                  banned: false,
                });
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                toast.success(result.message);
                router.refresh();
              })
            }
          >
            Unban customer
          </Button>
        )}
      </div>
    </div>
  );
}
