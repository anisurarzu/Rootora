import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import { requireSession } from "@/lib/auth-server";
import { formatBdDate } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your ROOTORA order history.",
};

function statusVariant(
  status: string
): "default" | "secondary" | "success" | "destructive" | "outline" {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "CANCELLED":
    case "REFUNDED":
      return "destructive";
    case "SHIPPED":
    case "PROCESSING":
    case "CONFIRMED":
      return "default";
    default:
      return "outline";
  }
}

export default async function OrdersPage() {
  const session = await requireSession();

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, ...activeOrderWhere },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track and review your past purchases.
        </p>
      </header>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <h2 className="mt-6 font-heading text-xl font-semibold text-heading">
              No orders yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              When you place an order, it will appear here with status and
              details.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Start shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" aria-label="Order history">
          {orders.map((order) => (
            <li key={order.id}>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <CardDescription>
                      Placed on{" "}
                      {formatBdDate(order.createdAt, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusVariant(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}× {item.product?.name ?? "Unavailable product"}
                      </li>
                    ))}
                  </ul>
                  <p className="font-heading text-lg font-semibold text-heading">
                    Total: {formatPrice(Number(order.total))}
                  </p>
                  <div className="mt-4">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/checkout/invoice?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(order.accessToken)}`}
                      >
                        Download invoice
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
