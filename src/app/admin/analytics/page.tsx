import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { SimpleBarChart, SimplePieChart, TrendChart } from "@/components/admin/trend-chart"
import { getDetailedAnalytics } from "@/server/admin/analytics"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function AnalyticsPage() {
  const analytics = await getDetailedAnalytics(90)
  const topProductData = analytics.topProducts.length
    ? analytics.topProducts.map((product) => ({ name: product.name, value: product.revenue }))
    : [{ name: "No data", value: 0 }]
  const categoryData = analytics.categoryRevenue.length
    ? analytics.categoryRevenue.map((entry) => ({ name: entry.category, value: entry.revenue }))
    : [{ name: "No data", value: 0 }]
  const paymentData = analytics.paymentMethodUsage.length
    ? analytics.paymentMethodUsage.map((entry) => ({ name: entry.method.toLowerCase(), value: entry.count }))
    : [{ name: "No data", value: 0 }]
  const statusData = analytics.orderStatusDistribution.length
    ? analytics.orderStatusDistribution.map((entry) => ({ name: entry.status.toLowerCase(), value: entry.count }))
    : [{ name: "No data", value: 0 }]

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="90-day performance insights."
        breadcrumb={[
          { label: "Analytics", href: "/admin/analytics" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Avg order value" value={analytics.averageOrderValue} subtitle="90-day" />
        <StatsCard
          title="Repeat buyers"
          value={analytics.repeatVsFirst.repeat}
          subtitle={`${analytics.repeatVsFirst.firstTime} first-time buyers`}
        />
        <StatsCard title="Top product" value={analytics.topProducts[0]?.revenue ?? 0} subtitle={analytics.topProducts[0]?.name ?? "—"} />
          {/* <StatsCard title="Cart items flagged" value={analytics.cartAbandonment} subtitle="Inactive 7+ days" /> */}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <TrendChart data={analytics.revenueTrend} yKey="revenue" label="Revenue" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New customers</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <TrendChart data={analytics.newCustomersTrend} yKey="count" label="New customers" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={topProductData} color="#0ea5e9" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={categoryData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={paymentData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={statusData} color="#f97316" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Repeat vs first-time</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart
              data={[
                { name: 'Repeat', value: analytics.repeatVsFirst.repeat },
                { name: 'First-time', value: analytics.repeatVsFirst.firstTime },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>High-value customers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">User ID</th>
                <th className="pb-2 font-medium">Orders</th>
                <th className="pb-2 font-medium">Total spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {analytics.highValueCustomers.map((customer) => (
                <tr key={customer.userId}>
                  <td className="py-3 font-mono text-xs">{customer.userId}</td>
                  <td className="py-3">
                    {analytics.ordersPerCustomer.find((entry) => entry.userId === customer.userId)?.orders ?? 0}
                  </td>
                  <td className="py-3 font-semibold">{formatPrice(customer.total, "KES")}</td>
                </tr>
              ))}
              {analytics.highValueCustomers.length === 0 && (
                <tr>
                  <td className="py-3 text-sm text-muted-foreground" colSpan={3}>
                    No customers exceeded the threshold in this window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
