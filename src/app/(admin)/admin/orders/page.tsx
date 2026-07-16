import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateOrderStatusForm } from "@/features/admin/actions/orders";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default async function AdminOrdersPage() {
  await requirePermission(["orders.view", "orders.manage"]);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true } },
    },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          Live orders from the database. Open any order for full fulfillment controls.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Order
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Items
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="px-6 py-3 font-button font-medium text-muted-foreground">
                      Total
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
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-heading">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleDateString("en-BD")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-heading">
                          {order.user?.name ?? "Guest"}
                        </span>
                        <span className="text-muted-foreground">
                          {order.user?.email ?? order.guestEmail ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.items.length}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{order.paymentStatus}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatPrice(Number(order.total))}
                      </td>
                      <td className="px-6 py-4">
                        <form
                          action={updateOrderStatusForm}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="orderId" value={order.id} />
                          <label
                            htmlFor={`status-${order.id}`}
                            className="sr-only"
                          >
                            Status for order {order.orderNumber}
                          </label>
                          <select
                            id={`status-${order.id}`}
                            name="status"
                            defaultValue={order.status}
                            className="h-9 rounded-lg border border-input bg-surface px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="outline">
                            Save
                          </Button>
                        </form>
                      </td>
                      <td className="px-6 py-4">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
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
