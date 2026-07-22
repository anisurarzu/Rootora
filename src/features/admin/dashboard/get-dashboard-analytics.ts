import type { OrderStatus, PaymentStatus, ProductStatus } from "@prisma/client";
import { activeOrderWhere } from "@/features/orders/order-status-code";
import {
  addBdDays,
  formatBdDate,
  startOfBdDay,
  toBdDayKey,
} from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

function formatDayLabel(date: Date) {
  return formatBdDate(date, { month: "short", day: "numeric" });
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export type DashboardAnalytics = Awaited<
  ReturnType<typeof getDashboardAnalytics>
>;

export async function getDashboardAnalytics() {
  const now = new Date();
  const today = startOfBdDay(now);
  const last30Start = addBdDays(today, -29);
  const prev30Start = addBdDays(last30Start, -30);

  const [
    productsTotal,
    productsPublished,
    productsDraft,
    productsArchived,
    customersTotal,
    newCustomers30,
    prevCustomers30,
    ordersLast60,
    orderStatusGroups,
    paymentStatusGroups,
    stockCandidates,
    recentOrders,
    topProductRows,
    pendingOrders,
    paidRevenueAllTime,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: last30Start } },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: prev30Start, lt: last30Start },
      },
    }),
    prisma.order.findMany({
      where: { ...activeOrderWhere, createdAt: { gte: prev30Start } },
      select: {
        createdAt: true,
        total: true,
        status: true,
        paymentStatus: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: activeOrderWhere,
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["paymentStatus"],
      where: activeOrderWhere,
      _count: { _all: true },
    }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { stockCount: "asc" },
      take: 50,
      select: {
        id: true,
        name: true,
        sku: true,
        stockCount: true,
        lowStockAlert: true,
        status: true,
      },
    }),
    prisma.order.findMany({
      where: activeOrderWhere,
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        address: { select: { name: true } },
      },
    }),
    // Raw SQL avoids Prisma deserializing nullable productId through a stale client.
    prisma.$queryRaw<Array<{ productId: string; quantity: number }>>`
      SELECT "productId", SUM(quantity)::int AS quantity
      FROM order_items
      WHERE "productId" IS NOT NULL
      GROUP BY "productId"
      ORDER BY quantity DESC
      LIMIT 6
    `,
    prisma.order.count({
      where: {
        ...activeOrderWhere,
        status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] },
      },
    }),
    prisma.order.aggregate({
      where: { ...activeOrderWhere, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  const topProductGroups = topProductRows.map((row) => ({
    productId: row.productId,
    _sum: { quantity: Number(row.quantity) },
  }));

  const lowStockCandidates = stockCandidates
    .filter((product) => product.stockCount <= product.lowStockAlert)
    .slice(0, 8);

  const currentPeriodOrders = ordersLast60.filter(
    (order) => order.createdAt >= last30Start
  );
  const previousPeriodOrders = ordersLast60.filter(
    (order) => order.createdAt < last30Start
  );

  const revenue30 = currentPeriodOrders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + Number(order.total), 0);
  const revenuePrev30 = previousPeriodOrders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + Number(order.total), 0);

  const orders30 = currentPeriodOrders.length;
  const ordersPrev30 = previousPeriodOrders.length;

  const aov30 = orders30 > 0 ? revenue30 / orders30 : 0;
  const aovPrev30 = ordersPrev30 > 0 ? revenuePrev30 / ordersPrev30 : 0;

  const dayKeys: string[] = [];
  for (let i = 0; i < 30; i += 1) {
    dayKeys.push(toBdDayKey(addBdDays(last30Start, i)));
  }

  const revenueByDay = new Map(dayKeys.map((key) => [key, 0]));
  const ordersByDay = new Map(dayKeys.map((key) => [key, 0]));

  for (const order of currentPeriodOrders) {
    const key = toBdDayKey(order.createdAt);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
    if (order.paymentStatus === "PAID") {
      revenueByDay.set(
        key,
        (revenueByDay.get(key) ?? 0) + Number(order.total)
      );
    }
  }

  const salesTrend = dayKeys.map((key) => {
    const date = new Date(`${key}T12:00:00+06:00`);
    return {
      date: key,
      label: formatDayLabel(date),
      revenue: Math.round(revenueByDay.get(key) ?? 0),
      orders: ordersByDay.get(key) ?? 0,
    };
  });

  const orderStatusBreakdown = orderStatusGroups.map((group) => ({
    status: group.status as OrderStatus,
    count: group._count._all,
  }));

  const paymentStatusBreakdown = paymentStatusGroups.map((group) => ({
    status: group.paymentStatus as PaymentStatus,
    count: group._count._all,
  }));

  const productIds = topProductGroups
    .map((group) => group.productId)
    .filter((id): id is string => Boolean(id));
  const topProductsMeta = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          thumbnail: true,
          images: true,
          price: true,
        },
      })
    : [];

  const productMap = new Map(
    topProductsMeta.map((product) => [product.id, product])
  );

  const topProducts = topProductGroups
    .map((group) => {
      if (!group.productId) return null;
      const product = productMap.get(group.productId);
      if (!product) return null;
      const quantitySold = group._sum.quantity ?? 0;
      return {
        id: product.id,
        name: product.name,
        image: product.thumbnail || product.images[0] || null,
        quantitySold,
        revenue: Math.round(Number(product.price) * quantitySold),
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    image: string | null;
    quantitySold: number;
    revenue: number;
  }>;

  return {
    generatedAt: now.toISOString(),
    kpis: {
      revenueAllTime: Number(paidRevenueAllTime._sum.total ?? 0),
      revenue30,
      revenueChange: percentChange(revenue30, revenuePrev30),
      orders30,
      ordersChange: percentChange(orders30, ordersPrev30),
      customersTotal,
      customersChange: percentChange(newCustomers30, prevCustomers30),
      newCustomers30,
      aov30,
      aovChange: percentChange(aov30, aovPrev30),
      productsTotal,
      productsPublished,
      productsDraft,
      productsArchived,
      pendingOrders,
      lowStockCount: lowStockCandidates.length,
    },
    salesTrend,
    orderStatusBreakdown,
    paymentStatusBreakdown,
    topProducts,
    lowStockProducts: lowStockCandidates.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stockCount: product.stockCount,
      lowStockAlert: product.lowStockAlert,
      status: product.status as ProductStatus,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      customerName: order.user?.name ?? order.address?.name ?? "Guest",
      customerEmail: order.user?.email ?? order.guestEmail ?? "—",
    })),
  };
}
