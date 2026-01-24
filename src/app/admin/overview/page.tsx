import { DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { TrendChart, SimpleBarChart } from "@/components/admin/trend-chart"
import { AdminPageHeader } from "@/components/admin/page-header"
import { getOverviewMetrics } from "@/server/admin/analytics"
import { formatPrice } from "@/lib/utils"

export default async function OverviewPage() {
  const metrics = await getOverviewMetrics()
  const statusData = metrics.ordersByStatus.length
    ? metrics.ordersByStatus.map((entry) => ({ name: entry.status.toLowerCase(), value: entry.count }))
    : [{ name: "no data", value: 0 }]

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Live summary of store performance."
        breadcrumb={[{ label: "Dashboard", href: "/admin/overview" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(metrics.totals.revenue)}
          subtitle="Since launch"
          icon={<DollarSign className="h-3 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="Total Orders"
          value={metrics.totals.orders.toLocaleString()}
          subtitle="All time"
          icon={<ShoppingBag className="h-3 w-4 text-blue-500" />}
        />
        <StatsCard
          title="Customers"
          value={metrics.totals.users.toLocaleString()}
          subtitle="Registered users"
          icon={<Users className="h-3 w-4 text-purple-500" />}
        />
        <StatsCard
          title="Active Products"
          value={metrics.totals.products.toLocaleString()}
          subtitle="Catalog size"
          icon={<Package className="h-3 w-4 text-orange-500" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-primary/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle>Revenue overview</CardTitle>
            <p className="text-sm text-muted-foreground">Daily revenue trend for the past 30 days.</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <TrendChart data={metrics.revenueTrend} yKey="revenue" label="Revenue" />
          </CardContent>
        </Card>
        <Card className="border border-primary/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle>Order mix</CardTitle>
            <p className="text-sm text-muted-foreground">Status distribution for current orders.</p>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={statusData} color="#2563eb" />
            <div className="mt-4 grid gap-2 text-sm">
              {metrics.ordersByStatus.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="capitalize text-muted-foreground">{entry.status.toLowerCase()}</span>
                  <span className="font-semibold text-foreground">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <p className="text-sm text-muted-foreground">Latest purchases flowing through TAC.</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="align-middle">
                  <td className="py-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3">
                    <div className="font-medium">{order.user?.name ?? "Customer"}</div>
                    <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                  </td>
                  <td className="py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  )
}
