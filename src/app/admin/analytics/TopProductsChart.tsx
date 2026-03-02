"use client"

import { SimpleBarChart } from "@/components/admin/trend-chart"
import { useCurrency } from "@/contexts/CurrencyContext"

export function TopProductsChart({ data }: { data: any[] }) {
    const { formatPrice } = useCurrency()
    return (
        <SimpleBarChart
            data={data}
            color="#2563eb"
            formatValue={(n) => formatPrice(n)}
        />
    )
}
