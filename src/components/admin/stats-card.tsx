"use client"

import type { ReactNode } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/hooks/useCountUp"

interface StatsCardProps {
  title: string
  value: number
  prefix?: string
  subtitle?: string
  change?: number
  icon?: ReactNode
}

export function StatsCard({
  title,
  value,
  prefix,
  subtitle,
  change,
  icon,
}: StatsCardProps) {
  const animatedValue = useCountUp(value)

  const changeColor =
    change === undefined
      ? "text-muted-foreground"
      : change >= 0
      ? "text-emerald-600"
      : "text-rose-600"

  return (
    <Card className="border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-muted-foreground">
          {title}
        </CardTitle>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        {/* Value */}
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {prefix}
            {animatedValue.toLocaleString()}
          </span>

          {change !== undefined && (
            <span className={cn("flex items-center text-sm font-medium", changeColor)}>
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
