import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { SimpleBarChart, SimplePieChart, TrendChart } from "@/components/admin/trend-chart"
import { getDetailedAnalytics } from "@/server/admin/analytics"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AnalyticsDateFilters } from "@/components/admin/AnalyticsDateFilters"
import { SmartInsight } from "@/components/admin/smart-insight"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { DollarSign, ShoppingBag, Users, BarChart3, TrendingUp, Star, Download, Trophy, Medal } from "lucide-react"

interface AnalyticsPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const query = await searchParams
  const daysParam = query?.days
  const days = Math.max(Number(Array.isArray(daysParam) ? daysParam[0] : daysParam ?? "90") || 90, 7)

  const analytics = await getDetailedAnalytics(days)

  const topProductData = analytics.topProducts.length
    ? analytics.topProducts.map((product) => ({ name: product.name, value: product.revenue }))
    : [{ name: "No data", value: 0 }]
  const categoryData = analytics.categoryRevenue.length
    ? analytics.categoryRevenue.map((entry) => ({ name: entry.category, value: entry.revenue }))
    : [{ name: "No data", value: 0 }]
  const paymentData = analytics.paymentMethodUsage.length
    ? analytics.paymentMethodUsage.map((entry) => ({ name: entry.method.toLowerCase(), value: entry.count }))
    : [{ name: "No data", value: 0 }]
  const statusOrder = ["CONFIRMED", "PENDING", "CANCELLED"]
  const statusColors: Record<string, string> = {
    CONFIRMED: "#4b9286", // teal
    PENDING: "#dfa053",   // gold
    CANCELLED: "#dd4c3a", // coral
  }

  const statusData = statusOrder.map((status) => {
    const match = analytics.orderStatusDistribution.find((entry) => entry.status === status)
    return {
      name: status.toLowerCase(),
      value: match?.count ?? 0,
      color: statusColors[status],
    }
  })

  const repeatRate = analytics.repeatVsFirst.repeat + analytics.repeatVsFirst.firstTime > 0
    ? (analytics.repeatVsFirst.repeat / (analytics.repeatVsFirst.repeat + analytics.repeatVsFirst.firstTime)) * 100
    : 0

  const topCategory = analytics.categoryRevenue.sort((a, b) => b.revenue - a.revenue)[0]?.category ?? "None"

  return (
    <div className="space-y-10 pb-20">
      <AdminPageHeader
        title="Analytics Console"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/overview" },
          { label: "Analytics", href: "/admin/analytics" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-brand-teal/20 text-brand-teal hover:bg-brand-teal/5">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <AnalyticsDateFilters currentDays={String(days)} action="/admin/analytics" />
          </div>
        }
        actionsAlignment="end"
      />

      {/* Strategic Insight Row */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2">
          <SmartInsight
            revenueGrowth={analytics.comparisons.revenueGrowth}
            orderGrowth={analytics.comparisons.orderGrowth}
            repeatRate={repeatRate}
            topCategory={topCategory}
          />
        </div>
        <Card className="border-brand-teal/10 bg-slate-50/50 flex flex-col justify-center p-6">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Growth Trend</span>
          </div>
          <p className="text-2xl font-black text-brand-umber">
            {analytics.comparisons.revenueGrowth >= 0 ? "+" : ""}{analytics.comparisons.revenueGrowth.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">vs previous period</p>
        </Card>
      </div>

      {/* Top Level KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={analytics.revenueTotal ?? 0}
          prefix="KES "
          subtitle={days === 1000 ? "Lifetime Earnings" : `Past ${days} days`}
          change={analytics.comparisons.revenueGrowth}
          icon={<DollarSign className="h-6 w-6" />}
          delay={0.1}
        />
        <StatsCard
          title="Avg Order Value"
          value={analytics.averageOrderValue}
          prefix="KES "
          subtitle="Revenue per transaction"
          change={analytics.comparisons.aovGrowth}
          icon={<BarChart3 className="h-6 w-6" />}
          delay={0.2}
        />
        <StatsCard
          title="Repeat Buyers"
          value={analytics.repeatVsFirst.repeat}
          subtitle={`${analytics.repeatVsFirst.firstTime} first-time buyers`}
          change={repeatRate} // Using repeat rate as the "growth" metric for context
          icon={<Users className="h-6 w-6" />}
          delay={0.3}
        />
        <StatsCard
          title="Order Volume"
          value={analytics.revenueTrend.reduce((sum, d) => sum + (d.orders ?? 0), 0)}
          subtitle="Total successful orders"
          change={analytics.comparisons.orderGrowth}
          icon={<ShoppingBag className="h-6 w-6" />}
          delay={0.4}
        />
      </div>

      {/* Trends Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-brand-teal/10 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Revenue Performance</CardTitle>
              <p className="text-xs text-slate-400">Daily revenue trends and spikes</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-tighter">
              <TrendingUp className="h-3 w-3" />
              Live Feed
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <TrendChart data={analytics.revenueTrend} yKey="revenue" label="Revenue (KES)" />
          </CardContent>
        </Card>
        <Card className="border-brand-teal/10 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Customer Acquisition</CardTitle>
              <p className="text-xs text-slate-400">New user registrations over time</p>
            </div>
            <Users className="h-5 w-5 text-slate-300" />
          </CardHeader>
          <CardContent className="pt-6">
            <TrendChart data={analytics.newCustomersTrend} yKey="count" label="New Customers" />
          </CardContent>
        </Card>
      </div>

      {/* Distribution Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-brand-teal/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={topProductData} color="#2563eb" />
          </CardContent>
        </Card>
        <Card className="border-brand-teal/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={categoryData} />
          </CardContent>
        </Card>
        <Card className="border-brand-teal/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Payment Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={paymentData} />
          </CardContent>
        </Card>
      </div>

      {/* Specific Distribution and Detailed Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-brand-teal/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Order Fulfillment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={statusData} color="#f59e0b" />
          </CardContent>
        </Card>
        <Card className="border-brand-teal/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-bold">Customer Retention Mix</CardTitle>
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

      <Card className="border-brand-teal/15 shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-brand-teal/5 border-b border-brand-teal/10 py-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-brand-umber flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              Top Spenders Leaderboard
            </CardTitle>
            <p className="text-xs text-slate-500 font-medium">Ranked by total contribution to revenue</p>
          </div>
          <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4 font-black">Rank & Customer</th>
                <th className="px-6 py-4 font-black text-center">Order Count</th>
                <th className="px-6 py-4 font-black text-right">Contribution Hub</th>
                <th className="px-6 py-4 font-black text-right pr-8">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.highValueCustomers.map((customer, index) => (
                <tr key={customer.userId} className="hover:bg-brand-teal/5 transition-all duration-300 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 shrink-0">
                        {index === 0 && <Trophy className="h-5 w-5 text-amber-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-slate-400" />}
                        {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                        {index > 2 && <span className="text-xs font-black text-slate-300">#{index + 1}</span>}
                      </div>
                      <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                        {customer.image ? (
                          <Image src={customer.image} alt={customer.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-black text-slate-400 uppercase">{customer.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/users/${customer.userId}`}
                          className="font-bold text-brand-umber group-hover:text-brand-teal transition-colors"
                        >
                          {customer.name}
                        </Link>
                        <span className="text-[10px] font-medium text-slate-400 tabular-nums">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-inset ring-slate-200/50">
                      {customer.orderCount}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right w-[200px]">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tabular-nums text-slate-700">{customer.contribution.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full max-w-[120px] rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200/20">
                        <div
                          className="h-full bg-brand-teal rounded-full shadow-[0_0_8px_rgba(45,59,52,0.3)] transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(customer.contribution, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right pr-8 font-black text-brand-umber text-base tabular-nums">
                    {formatPrice(customer.total)}
                  </td>
                  <td className="py-3 font-semibold">{formatPrice(customer.total, "KES")}</td>
                </tr>
              ))}
              {analytics.highValueCustomers.length === 0 && (
                <tr>
                  <td className="py-16 text-center text-sm text-slate-400 font-medium italic" colSpan={4}>
                    No premium customer data available for this range.
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
