import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  icon?: ReactNode
}

export function StatsCard({ title, value, subtitle, change, icon }: StatsCardProps) {
  const changeColor = change === undefined ? "text-muted-foreground" : change >= 0 ? "text-emerald-600" : "text-rose-600"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs", changeColor)}>
          {subtitle}
          {change !== undefined ? ` · ${change >= 0 ? "+" : ""}${change.toFixed(1)}%` : null}
        </p>
      </CardContent>
    </Card>
  )
}
