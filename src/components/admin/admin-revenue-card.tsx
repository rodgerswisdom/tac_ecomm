"use client"

import { DollarSign } from "lucide-react"
import { useCurrency } from "@/contexts/CurrencyContext"
import { convertToUsd } from "@/lib/currency"
import type { CurrencyCode } from "@/lib/currency"
import { StatsCard } from "@/components/admin/stats-card"

const CURRENCY_ALIAS: Record<string, CurrencyCode> = {
  KES: "KSH",
  USD: "USD",
  EUR: "EUR",
  KSH: "KSH",
}

interface AdminRevenueCardProps {
  revenue: number
  /** Currency the revenue was summed in (e.g. DEFAULT_CURRENCY). So KES 359 shows as 359, not 46k. */
  revenueCurrency?: string | null
  subtitle?: string
}

export function AdminRevenueCard({ revenue, revenueCurrency, subtitle }: AdminRevenueCardProps) {
  const { formatPrice } = useCurrency()
  const code = revenueCurrency ? CURRENCY_ALIAS[revenueCurrency.toUpperCase()] : undefined
  const amountUsd = code ? convertToUsd(revenue, code) : revenue
  return (
    <StatsCard
      title="Total Revenue"
      value={revenue}
      formattedValue={formatPrice(amountUsd)}
      subtitle={subtitle ?? (revenue === 0 ? "Waiting for payments" : "Paid orders only")}
      icon={<DollarSign className="h-8 w-5 text-emerald-500" />}
    />
  )
}
