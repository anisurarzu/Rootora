import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCharts } from "@/features/admin/dashboard/dashboard-charts";
import { DashboardKpis } from "@/features/admin/dashboard/dashboard-kpis";
import { getDashboardAnalytics } from "@/features/admin/dashboard/get-dashboard-analytics";
import { requirePermission } from "@/lib/auth-server";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requirePermission("dashboard.view");
  const analytics = await getDashboardAnalytics();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Business overview
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-heading">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live analytics from your ROOTORA store database.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Updated{" "}
          {new Date(analytics.generatedAt).toLocaleString("en-BD", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      <DashboardKpis kpis={analytics.kpis} />
      <DashboardCharts
        data={{
          salesTrend: analytics.salesTrend,
          orderStatusBreakdown: analytics.orderStatusBreakdown,
          paymentStatusBreakdown: analytics.paymentStatusBreakdown,
          topProducts: analytics.topProducts,
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest purchases from the database</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {analytics.recentOrders.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                No orders yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border text-left">
                      <th className="px-6 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Order
                      </th>
                      <th className="px-6 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Customer
                      </th>
                      <th className="px-6 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 font-button text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-heading hover:underline"
                          >
                            #{order.orderNumber}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-BD")}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <span className="block text-heading">
                            {order.customerName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.customerEmail}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">{order.status}</Badge>
                            <Badge
                              variant={
                                order.paymentStatus === "PAID"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium">
                          {formatPrice(order.total)}
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
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Low stock alerts</CardTitle>
              <CardDescription>
                Products at or below threshold
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/products">Inventory</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {analytics.lowStockProducts.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                All tracked products are above their low-stock alerts.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {analytics.lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-6 py-3"
                  >
                    <div>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-heading hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {product.sku || "No SKU"} · alert at{" "}
                        {product.lowStockAlert}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {product.stockCount} left
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
