"use client"

import { StatsCard } from "@/components/admin/stats-card"
import { useCurrency } from "@/contexts/CurrencyContext"
import { DollarSign, ShoppingBag, Users, BarChart3 } from "lucide-react"

interface AnalyticsKpiCardsProps {
  revenueTotal: number
  averageOrderValue: number
  repeatBuyers: number
  firstTimeBuyers: number
  orderVolume: number
  revenueGrowth: number
  aovGrowth: number
  orderGrowth: number
  repeatRate: number
  days: number
}

export function AnalyticsKpiCards({
  revenueTotal,
  averageOrderValue,
  repeatBuyers,
  firstTimeBuyers,
  orderVolume,
  revenueGrowth,
  aovGrowth,
  orderGrowth,
  repeatRate,
  days,
}: AnalyticsKpiCardsProps) {
  const { formatPrice } = useCurrency()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value={revenueTotal}
        formattedValue={formatPrice(revenueTotal)}
        subtitle={days === 1000 ? "Lifetime Earnings" : `Past ${days} days`}
        change={revenueGrowth}
        icon={<DollarSign className="h-6 w-6" />}
      />
      <StatsCard
        title="Avg Order Value"
        value={averageOrderValue}
        formattedValue={formatPrice(averageOrderValue)}
        subtitle="Revenue per transaction"
        change={aovGrowth}
        icon={<BarChart3 className="h-6 w-6" />}
      />
      <StatsCard
        title="Repeat Buyers"
        value={repeatBuyers}
        subtitle={`${firstTimeBuyers} first-time buyers`}
        change={repeatRate}
        icon={<Users className="h-6 w-6" />}
      />
      <StatsCard
        title="Order Volume"
        value={orderVolume}
        subtitle="Total successful orders"
        change={orderGrowth}
        icon={<ShoppingBag className="h-6 w-6" />}
      />
    </div>
  )
}
