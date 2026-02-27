"use client"

import { TrendChart } from "@/components/admin/trend-chart"
import { useCurrency } from "@/contexts/CurrencyContext"
import type { TrendDatum } from "@/components/admin/trend-chart"

export function RevenueTrendChart({ data }: { data: TrendDatum[] }) {
  const { formatPrice } = useCurrency()
  return (
    <TrendChart
      data={data}
      yKey="revenue"
      label="Revenue"
      formatValue={(n) => formatPrice(n)}
    />
  )
}
