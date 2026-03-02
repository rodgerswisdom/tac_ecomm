"use client"

import { SimplePieChart } from "@/components/admin/trend-chart"
import { useCurrency } from "@/contexts/CurrencyContext"

export function CategoryRevenueChart({ data }: { data: any[] }) {
    const { formatPrice } = useCurrency()
    return (
        <SimplePieChart
            data={data}
            formatValue={(n) => formatPrice(n)}
        />
    )
}
