"use client"

import type { CurrencyCode } from "@/lib/currency"
import { convertToUsd } from "@/lib/currency"
import { useCurrency } from "@/contexts/CurrencyContext"

const CURRENCY_ALIAS: Record<string, CurrencyCode> = {
  KES: "KSH",
  USD: "USD",
  EUR: "EUR",
  KSH: "KSH",
}

function toCurrencyCode(s: string | null | undefined): CurrencyCode | undefined {
  if (!s) return undefined
  const u = s.toUpperCase()
  return CURRENCY_ALIAS[u] ?? (u === "KSH" || u === "USD" || u === "EUR" ? (u as CurrencyCode) : undefined)
}

/**
 * Renders a price in the admin-selected currency.
 * - When amountCurrency is omitted, amount is treated as USD (e.g. product prices).
 * - When amountCurrency is set, amount is in that currency (e.g. order total in KES) and is converted for display.
 */
export function AdminFormattedPrice({
  amount,
  amountCurrency,
}: {
  amount: number
  /** Currency the amount is stored in (e.g. order.currency). Use for orders/payments so KES 359 doesn't become 46k. */
  amountCurrency?: string | null
}) {
  const { formatPrice } = useCurrency()
  const code = toCurrencyCode(amountCurrency)
  const amountUsd = code ? convertToUsd(amount, code) : amount
  return <>{formatPrice(amountUsd)}</>
}
