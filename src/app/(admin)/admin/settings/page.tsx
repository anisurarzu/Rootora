import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [roleCount, permissionCount, adminCount, managerCount] =
    await Promise.all([
      prisma.role.count(),
      prisma.permission.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "MANAGER" } }),
    ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles</CardTitle>
          <CardDescription>Defined access roles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-semibold text-heading">
            {roleCount}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/admin/settings/roles">Manage roles</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permissions</CardTitle>
          <CardDescription>Assignable capability keys</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-semibold text-heading">
            {permissionCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admins</CardTitle>
          <CardDescription>Users with ADMIN role</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-semibold text-heading">
            {adminCount}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/admin/settings/users">Assign roles</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Managers</CardTitle>
          <CardDescription>Users with MANAGER role</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-semibold text-heading">
            {managerCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
