import { Package, ShoppingBag, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { AdminRevenueCard } from "@/components/admin/admin-revenue-card"
import { AdminFormattedPrice } from "@/components/admin/admin-formatted-price"
import { TrendChart, SimpleBarChart } from "@/components/admin/trend-chart"
import { AdminPageHeader } from "@/components/admin/page-header"
import { getOverviewMetrics } from "@/server/admin/analytics"

export default async function OverviewPage() {
  const metrics = await getOverviewMetrics()

  const statusData = metrics.ordersByStatus.map((e) => ({
    name: e.status.toLowerCase(),
    value: e.count,
  }))

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Live summary of store performance."
        breadcrumb={[{ label: "Dashboard", href: "/admin/overview" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminRevenueCard revenue={metrics.totals.revenue} />
        <StatsCard
          title="Paid Orders"
          value={metrics.totals.orders}
          subtitle="Completed payments"
          icon={<ShoppingBag className="h-8 w-5 text-blue-500" />}
        />
        <StatsCard
          title="Customers"
          value={metrics.totals.users}
          subtitle="Registered users"
          icon={<Users className="h-8 w-5 text-purple-500" />}
        />
        <StatsCard
          title="Active Products"
          value={metrics.totals.products}
          subtitle="Catalog size"
          icon={<Package className="h-8 w-5 text-orange-500" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {metrics.revenueTrend.some((d) => d.revenue > 0) ? (
              <TrendChart
                data={metrics.revenueTrend}
                yKey="revenue"
                label="Revenue"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No paid revenue yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order mix</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <SimpleBarChart data={statusData} />
            ) : (
              <div className="text-sm text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {metrics.recentOrders.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground">
                    No recent orders
                  </td>
                </tr>
              )}
              {metrics.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3">{order.orderNumber}</td>
                  <td className="py-3">
                    {order.user?.email ?? "Customer"}
                  </td>
                  <td className="py-3 font-semibold">
                    <AdminFormattedPrice amount={order.total} amountCurrency={order.currency === "USD" ? undefined : order.currency} />
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
