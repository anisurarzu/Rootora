"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { DashboardAnalytics } from "@/features/admin/dashboard/get-dashboard-analytics";

const CHART = {
  primary: "#355E3B",
  secondary: "#739072",
  accent: "#A9B388",
  muted: "#9CA3AF",
  warning: "#D97706",
  grid: "rgba(148, 163, 184, 0.25)",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#D97706",
  CONFIRMED: "#739072",
  PROCESSING: "#355E3B",
  SHIPPED: "#4F6F52",
  DELIVERED: "#16A34A",
  CANCELLED: "#DC2626",
  REFUNDED: "#9CA3AF",
  PAID: "#16A34A",
  FAILED: "#DC2626",
};

type DashboardChartsProps = {
  data: Pick<
    DashboardAnalytics,
    | "salesTrend"
    | "orderStatusBreakdown"
    | "paymentStatusBreakdown"
    | "topProducts"
  >;
};

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const hasTrend = data.salesTrend.some(
    (day) => day.revenue > 0 || day.orders > 0
  );

  const orderStatusData = data.orderStatusBreakdown.map((item) => ({
    name: item.status,
    count: item.count,
  }));

  const paymentStatusData = data.paymentStatusBreakdown.map((item) => ({
    name: item.status,
    count: item.count,
  }));

  const topProductsData = data.topProducts.map((product) => ({
    name:
      product.name.length > 16
        ? `${product.name.slice(0, 16)}…`
        : product.name,
    fullName: product.name,
    units: product.quantitySold,
    revenue: product.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Line chart — revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend (line chart)</CardTitle>
            <CardDescription>
              Paid revenue over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {!hasTrend ? (
              <EmptyChart message="No revenue data yet. Charts will appear after paid orders." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesTrend} margin={{ top: 8, right: 8 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${Math.round(Number(value) / 1000)}k`
                        : String(value)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lift">
                          <p className="mb-1 font-button font-medium text-heading">
                            {label}
                          </p>
                          <p className="text-muted-foreground">
                            Revenue:{" "}
                            {formatPrice(Number(payload[0]?.value ?? 0))}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={CHART.primary}
                    strokeWidth={3}
                    dot={{ r: 3, fill: CHART.primary }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar chart — daily orders */}
        <Card>
          <CardHeader>
            <CardTitle>Daily orders (bar chart)</CardTitle>
            <CardDescription>
              Order count per day for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {!hasTrend ? (
              <EmptyChart message="No order volume yet. Bars will appear after orders are placed." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesTrend} margin={{ top: 8, right: 8 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lift">
                          <p className="mb-1 font-button font-medium text-heading">
                            {label}
                          </p>
                          <p className="text-muted-foreground">
                            Orders: {Number(payload[0]?.value ?? 0)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill={CHART.secondary}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Bar chart — order status */}
        <Card>
          <CardHeader>
            <CardTitle>Order status (bar chart)</CardTitle>
            <CardDescription>Fulfillment breakdown by status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {orderStatusData.length === 0 ? (
              <EmptyChart message="No orders to chart yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData} margin={{ top: 8, right: 8 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                    {orderStatusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? CHART.primary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar chart — payment status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment status (bar chart)</CardTitle>
            <CardDescription>Collection health by payment state</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {paymentStatusData.length === 0 ? (
              <EmptyChart message="No payment data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentStatusData} margin={{ top: 8, right: 8 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                    {paymentStatusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? CHART.primary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Combined line + bar comparison and top products bars */}
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Revenue vs orders (line + bar)</CardTitle>
            <CardDescription>
              Line = revenue, bars = daily order count
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {!hasTrend ? (
              <EmptyChart message="No activity in the last 30 days yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.salesTrend} margin={{ top: 8, right: 12 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="left"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${Math.round(Number(value) / 1000)}k`
                        : String(value)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lift">
                          <p className="mb-1 font-button font-medium text-heading">
                            {label}
                          </p>
                          {payload.map((entry) => (
                            <p
                              key={String(entry.dataKey)}
                              className="text-muted-foreground"
                            >
                              {entry.name}:{" "}
                              {entry.dataKey === "revenue"
                                ? formatPrice(Number(entry.value ?? 0))
                                : Number(entry.value ?? 0)}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="orders"
                    dataKey="orders"
                    name="Orders"
                    fill={CHART.accent}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={CHART.primary}
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Top products (bar chart)</CardTitle>
            <CardDescription>Units sold</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {topProductsData.length === 0 ? (
              <EmptyChart message="No product sales recorded yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ left: 8, right: 12 }}
                >
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0]?.payload as {
                        fullName: string;
                        units: number;
                        revenue: number;
                      };
                      return (
                        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lift">
                          <p className="font-button font-medium text-heading">
                            {row.fullName}
                          </p>
                          <p className="text-muted-foreground">
                            Units: {row.units}
                          </p>
                          <p className="text-muted-foreground">
                            Est. revenue: {formatPrice(row.revenue)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="units"
                    name="Units sold"
                    fill={CHART.primary}
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
