"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { assignUserRole } from "@/features/admin/actions/roles";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type RoleOption = {
  id: string;
  name: string;
  slug: string;
};

type UsersRoleManagerProps = {
  users: UserRow[];
  roles: RoleOption[];
  canManage: boolean;
  currentUserId: string;
};

export function UsersRoleManager({
  users,
  roles,
  canManage,
  currentUserId,
}: UsersRoleManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, search]);

  function onRoleChange(userId: string, roleSlug: string) {
    if (!canManage) {
      toast.error("You do not have permission to assign roles.");
      return;
    }

    startTransition(async () => {
      const result = await assignUserRole(userId, roleSlug);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign user roles</CardTitle>
        <CardDescription>
          Change a user’s role to control what they can access in admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current role
                </th>
                <th className="px-4 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Assign role
                </th>
                <th className="px-4 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-heading">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                        {user.id === currentUserId ? " · you" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "accent" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={user.role}
                        disabled={!canManage || pending}
                        onValueChange={(value) => onRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.slug}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
