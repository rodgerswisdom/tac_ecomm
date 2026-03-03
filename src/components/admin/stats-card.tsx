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
  formattedValue?: ReactNode
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

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  const changeConfig = {
    color: isPositive ? "text-emerald-600 bg-emerald-500/10" : isNegative ? "text-rose-600 bg-rose-500/10" : "text-slate-500 bg-slate-500/10",
    icon: isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden border border-brand-teal/10 bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-brand-teal/30 rounded-2xl lg:rounded-3xl">
        <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-brand-teal/5 transition-transform duration-500 group-hover:scale-150" />

        <CardContent className="p-4 lg:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 lg:space-y-2 min-w-0">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {title}
              </p>
              <div className="flex flex-col items-start gap-1">
                <span className="text-xl lg:text-3xl font-bold tracking-tight text-foreground truncate w-full">
                  {formattedValue !== undefined ?
                    formattedValue : `${prefix ?? ''}${animatedValue.toLocaleString()}`}
                </span>
                {change !== undefined && (
                  <div className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset",
                    changeConfig.color,
                    isPositive ? "ring-emerald-500/20" : isNegative ? "ring-rose-500/20" : "ring-slate-500/20"
                  )}>
                    <changeConfig.icon className="h-3 w-3 stroke-[3]" />
                    <span>{Math.abs(change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl lg:rounded-2xl bg-brand-teal/10 text-brand-teal shadow-inner">
              {icon}
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-3 lg:mt-4 text-[10px] lg:text-xs text-muted-foreground border-t border-slate-50 pt-2 lg:pt-3">
              {subtitle}
            </p>
          )}
        </CardContent>

      </Card>
    </motion.div>
  )
}
