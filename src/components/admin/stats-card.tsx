"use client"

import type { ReactNode } from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/hooks/useCountUp"
import { delay, motion } from "framer-motion"

interface StatsCardProps {
  title: string
  value: number
  prefix?: string
  /** When set, shown instead of prefix+value (e.g. currency-formatted amount) */
  formattedValue?: string
  subtitle?: string
  change?: number
  icon?: ReactNode
  delay?: number
}

export function StatsCard({
  title,
  value,
  prefix,
  formattedValue,
  subtitle,
  change,
  icon,
  delay = 0
}: StatsCardProps) {
  const animatedValue = useCountUp(value)

  const changeColor =
    change === undefined
      ? "text-muted-foreground"
      : change >= 0
      ? "text-emerald-600"
      : "text-rose-600"

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change !== undefined && change === 0

  const changeConfig = {
    color: isPositive ? "text-emerald-600 bg-emerald-500/10" : isNegative ? "text-rose-600 bg-rose-500/10" : "text-slate-500 bg-slate-500/10",
    icon: isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus,
    label: isPositive ? "increase" : isNegative ? "decrease" : "no change"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden border border-brand-teal/10 bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-brand-teal/30">
        <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-brand-teal/5 transition-transform duration-500 group-hover:scale-150" />

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {title}
              </p>
              {change !== undefined && (
                <div className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                  changeConfig.color,
                  isPositive ? "ring-emerald-500/20" : isNegative ? "ring-rose-500/20" : "ring-slate-500/20"
                )}>
                  <changeConfig.icon className="h-3.5 w-3.5 stroke-[3]" />
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
              {icon}
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
