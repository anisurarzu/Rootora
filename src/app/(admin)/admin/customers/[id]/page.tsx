import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerActions } from "@/features/admin/components/customer-actions";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { formatPrice } from "@/lib/utils";
import { formatBdDate } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const session = await requirePermission([
    "customers.view",
    "customers.manage",
  ]);
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("customers.manage");
  const { id } = await params;

  const [customer, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          where: activeOrderWhere,
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
          },
        },
        addresses: true,
        _count: {
          select: {
            orders: { where: activeOrderWhere },
            reviews: true,
          },
        },
      },
    }),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="font-button text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to customers
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold text-heading">
            {customer.name}
          </h1>
          <Badge variant={customer.banned ? "destructive" : "success"}>
            {customer.banned ? "Banned" : "Active"}
          </Badge>
          <Badge variant="outline">{customer.role}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{customer.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerActions
              userId={customer.id}
              name={customer.name}
              phone={customer.phone}
              role={customer.role}
              banned={Boolean(customer.banned)}
              roles={roles}
              canManage={canManage}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Orders:</span>{" "}
              {customer._count.orders}
            </p>
            <p>
              <span className="text-muted-foreground">Reviews:</span>{" "}
              {customer._count.reviews}
            </p>
            <p>
              <span className="text-muted-foreground">Joined:</span>{" "}
              {formatBdDate(customer.createdAt)}
            </p>
            {customer.banReason ? (
              <p>
                <span className="text-muted-foreground">Ban reason:</span>{" "}
                {customer.banReason}
              </p>
            ) : null}
            <div className="border-t border-border pt-3">
              <p className="font-button text-xs uppercase tracking-wider text-muted-foreground">
                Addresses
              </p>
              {customer.addresses.length === 0 ? (
                <p className="mt-2 text-muted-foreground">No addresses.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {customer.addresses.map((address) => (
                    <li key={address.id} className="rounded-lg border border-border p-3">
                      <p className="font-medium">{address.label}</p>
                      <p className="text-muted-foreground">
                        {address.addressLine1}, {address.district}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customer.orders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 font-button text-muted-foreground">
                      Order
                    </th>
                    <th className="px-6 py-3 font-button text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 font-button text-muted-foreground">
                      Payment
                    </th>
                    <th className="px-6 py-3 font-button text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="border-b border-border">
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3">{order.status}</td>
                      <td className="px-6 py-3">{order.paymentStatus}</td>
                      <td className="px-6 py-3">
                        {formatPrice(Number(order.total))}
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
