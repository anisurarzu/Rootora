import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderActions } from "@/features/admin/components/order-actions";
import { ORDER_STATUS_CODE_DELETED } from "@/features/orders/order-status-code";
import {
  getPermissionsForRole,
  requirePermission,
} from "@/lib/auth-server";
import { formatPrice } from "@/lib/utils";
import { formatBdDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await requirePermission(["orders.view", "orders.manage"]);
  const permissions = await getPermissionsForRole(session.user.role);
  const canManage = permissions.includes("orders.manage");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, thumbnail: true } },
        },
      },
      coupon: { select: { code: true, discountType: true, discountValue: true } },
    },
  });

  if (!order || order.statusCode === ORDER_STATUS_CODE_DELETED) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="font-button text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-heading">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatBdDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{order.status}</Badge>
          <Badge>{order.paymentStatus}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3"
              >
                <div>
                  <Link
                    href={`/admin/products/${item.product.id}/edit`}
                    className="font-medium text-heading hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
            <dl className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{formatPrice(Number(order.shipping))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd>{formatPrice(Number(order.discount))}</dd>
              </div>
              <div className="flex justify-between font-semibold text-heading">
                <dt>Total</dt>
                <dd>{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                {order.user ? (
                  <>
                    <p className="font-medium text-heading">{order.user.name}</p>
                    <p className="text-muted-foreground">{order.user.email}</p>
                    {order.user.phone ? (
                      <p className="text-muted-foreground">{order.user.phone}</p>
                    ) : null}
                    <Button asChild size="sm" variant="outline" className="mt-2">
                      <Link href={`/admin/customers/${order.user.id}`}>
                        View customer
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-heading">Guest checkout</p>
                    <p className="text-muted-foreground">
                      {order.guestEmail || "No account email"}
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-2">
                      <Link
                        href={`/checkout/invoice?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(order.accessToken)}`}
                        target="_blank"
                      >
                        Open invoice
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-button text-xs uppercase tracking-wider text-muted-foreground">
                  Address
                </p>
                <p className="mt-1 text-heading">{order.address.name}</p>
                <p className="text-muted-foreground">{order.address.phone}</p>
                <p className="text-muted-foreground">
                  {order.address.addressLine1}
                  {order.address.addressLine2
                    ? `, ${order.address.addressLine2}`
                    : ""}
                </p>
                <p className="text-muted-foreground">
                  {order.address.district}, {order.address.postalCode}
                </p>
              </div>
              {order.coupon ? (
                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground">
                    Coupon:{" "}
                    <span className="font-medium text-heading">
                      {order.coupon.code}
                    </span>
                  </p>
                </div>
              ) : null}
              {order.paymentMethod ? (
                <p className="text-muted-foreground">
                  Payment method: {order.paymentMethod}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfillment controls</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderActions
                orderId={order.id}
                orderNumber={order.orderNumber}
                status={order.status}
                paymentStatus={order.paymentStatus}
                notes={order.notes}
                canManage={canManage}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
