import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requirePermission(["customers.view", "customers.manage"]);

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Customers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Registered users from the database. Open a profile to manage details.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All users ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No users registered yet.
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
                      Email
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Orders
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-heading">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            customer.role === "ADMIN" ? "accent" : "secondary"
                          }
                        >
                          {customer.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer._count.orders}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={customer.banned ? "destructive" : "success"}
                        >
                          {customer.banned ? "Banned" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/customers/${customer.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
