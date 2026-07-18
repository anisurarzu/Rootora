import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AdminOrdersTable,
  type AdminOrderRow,
} from "@/features/admin/components/admin-orders-table";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requirePermission(["orders.view", "orders.manage"]);

  const orders = await prisma.order.findMany({
    where: activeOrderWhere,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true } },
    },
  });

  const rows: AdminOrderRow[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    guestEmail: order.guestEmail,
    itemCount: order.items.length,
    user: order.user,
  }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          Live orders from the database. Open any order for full fulfillment
          controls.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdminOrdersTable orders={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
