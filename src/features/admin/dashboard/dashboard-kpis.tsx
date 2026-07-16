import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { DashboardAnalytics } from "@/features/admin/dashboard/get-dashboard-analytics";

type KpiCardsProps = {
  kpis: DashboardAnalytics["kpis"];
};

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={
        positive
          ? "inline-flex items-center gap-0.5 text-xs font-medium text-success"
          : "inline-flex items-center gap-0.5 text-xs font-medium text-destructive"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value)}% vs prior 30d
    </span>
  );
}

export function DashboardKpis({ kpis }: KpiCardsProps) {
  const cards = [
    {
      label: "Revenue (30d)",
      value: formatPrice(Math.round(kpis.revenue30)),
      href: "/admin/orders",
      icon: Wallet,
      trend: kpis.revenueChange,
      hint: `All-time paid: ${formatPrice(Math.round(kpis.revenueAllTime))}`,
    },
    {
      label: "Orders (30d)",
      value: kpis.orders30.toLocaleString(),
      href: "/admin/orders",
      icon: ShoppingCart,
      trend: kpis.ordersChange,
      hint: `${kpis.pendingOrders} need fulfillment`,
    },
    {
      label: "Customers",
      value: kpis.customersTotal.toLocaleString(),
      href: "/admin/customers",
      icon: Users,
      trend: kpis.customersChange,
      hint: `+${kpis.newCustomers30} new in 30 days`,
    },
    {
      label: "Avg. order value",
      value: formatPrice(Math.round(kpis.aov30)),
      href: "/admin/orders",
      icon: Package,
      trend: kpis.aovChange,
      hint: `${kpis.productsPublished} published products`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="block transition-opacity hover:opacity-90"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="font-button text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <p className="mt-2 font-heading text-2xl font-semibold text-heading">
                    {card.value}
                  </p>
                </div>
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <card.icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <Trend value={card.trend} />
                <p className="text-xs text-muted-foreground">{card.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Catalog health</CardDescription>
            <CardTitle className="text-lg">
              {kpis.productsTotal} products
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {kpis.productsPublished} published · {kpis.productsDraft} draft ·{" "}
            {kpis.productsArchived} archived
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Operations queue</CardDescription>
            <CardTitle className="text-lg">
              {kpis.pendingOrders} open orders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Pending, confirmed, or processing fulfillment.
          </CardContent>
        </Card>
        <Card className={kpis.lowStockCount > 0 ? "border-warning/40" : undefined}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              {kpis.lowStockCount > 0 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              ) : null}
              Inventory alerts
            </CardDescription>
            <CardTitle className="text-lg">
              {kpis.lowStockCount} low stock
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Items at or below their low-stock threshold.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
