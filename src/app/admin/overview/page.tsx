import { CheckCircle, Clock,XCircle,RotateCw,Ban,HelpCircle, DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { TrendChart, SimpleBarChart } from "@/components/admin/trend-chart"
import { AdminPageHeader } from "@/components/admin/page-header"
import { getOverviewMetrics } from "@/server/admin/analytics"
import { formatPrice } from "@/lib/utils"

export default async function OverviewPage() {
  const metrics = await getOverviewMetrics()

  const statusOrder = ["CONFIRMED", "PENDING", "CANCELLED"]
  const statusColors: Record<string, string> = {
    CONFIRMED: "#4b9286", // teal
    PENDING: "#dfa053",   // gold
    CANCELLED: "#dd4c3a", // coral
  }

  const orderDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  function formatOrderDate(date: Date | string) {
    return orderDateFormatter.format(new Date(date))
  }

  const statusData = statusOrder.map((status) => {
    const match = metrics.ordersByStatus.find((e) => e.status === status)
    return {
      name: status.toLowerCase(),
      value: match?.count ?? 0,
      color: statusColors[status],
    }
  })

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Live summary of store performance."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={metrics.totals.revenue.value}
          prefix="KSh "
          subtitle={metrics.totals.revenue.value === 0 ? "Waiting for payments" : "Paid orders only"}
          icon={<DollarSign className="h-8 w-5 text-brand-gold" />}
        />
        <StatsCard
          title="Paid Orders"
          value={metrics.totals.orders.value}
          subtitle="Completed payments"
          icon={<ShoppingBag className="h-8 w-5 text-brand-teal" />}
        />
        <StatsCard
          title="Customers"
          value={metrics.totals.users.value}
          subtitle="Registered users"
          icon={<Users className="h-8 w-5 text-brand-coral" />}
        />
        <StatsCard
          title="Active Products"
          value={metrics.totals.products.value}
          subtitle="Catalog size"
          icon={<Package className="h-8 w-5 text-brand-umber" />}
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
                color="#dfa053"
                height={240}
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
              <SimpleBarChart data={statusData} color="#4b9286" />
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
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Order #</th>
                <th className="px-4 py-3 text-left text-xs">Date</th>
                <th className="px-4 py-3 text-left text-xs">Customer</th>
                <th className="px-4 py-3 text-left text-xs">Payment status</th>
                <th className="px-4 py-3 text-left text-xs">Total price</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground">
                    No recent orders
                  </td>
                </tr>
              )}
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{order.orderNumber}</td>
                  <td className="px-4 py-3 ">
                    {formatOrderDate(order.createdAt)}:
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.user?.email ?? "Customer"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: order.paymentStatus === "COMPLETED" ? "#f0fdf4" : order.paymentStatus === "FAILED" ? "#fde2e1" : order.paymentStatus === "PENDING" ? "#fef3c7" : "#f3f4f6",
                        color: order.paymentStatus === "COMPLETED" ? "#166534" : order.paymentStatus === "FAILED" ? "#b91c1c" : order.paymentStatus === "PENDING" ? "#92400e" : "#374151"
                      }}
                    >
                      {(() => {
                        switch (order.paymentStatus) {
                          case "COMPLETED":
                            return <><CheckCircle className="h-3 w-3 text-emerald-500 inline mr-1" />Paid</>;
                          case "PENDING":
                            return <><Clock className="h-3 w-3 text-amber-500 inline mr-1" />Pending</>;
                          case "FAILED":
                            return <><XCircle className="h-3 w-3 text-rose-500 inline mr-1" />Failed</>;
                          case "REFUNDED":
                            return <><RotateCw className="h-3 w-3 text-blue-500 inline mr-1" />Refunded</>;
                          case "CANCELLED":
                            return <><Ban className="h-3 w-3 text-gray-500 inline mr-1" />Cancelled</>;
                          default:
                            return <><HelpCircle className="h-3 w-3 text-slate-400 inline mr-1" />{order.paymentStatus}</>;
                        }
                      })()}
                    </span>
                  </td>
                  <td className="py-3 font-semibold">
                    {formatPrice(order.total)}
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
