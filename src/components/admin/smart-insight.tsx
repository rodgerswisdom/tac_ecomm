"use client"

import { Lightbulb, TrendingUp, TrendingDown, Users } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface SmartInsightProps {
    revenueGrowth: number
    orderGrowth: number
    repeatRate: number
    topCategory: string
}

export function SmartInsight({ revenueGrowth, orderGrowth, repeatRate, topCategory }: SmartInsightProps) {
    const isPositive = revenueGrowth > 0

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="border-brand-teal/20 bg-gradient-to-br from-brand-teal/5 to-white shadow-sm overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
                            <Lightbulb className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-brand-umber">Strategic Insight</h4>
                            <p className="text-sm leading-relaxed text-slate-600">
                                Your revenue has {isPositive ? "increased" : "decreased"} by{" "}
                                <span className={isPositive ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                                    {Math.abs(revenueGrowth).toFixed(1)}%
                                </span>{" "}
                                recently, primarily driven by{" "}
                                <span className="font-bold text-brand-teal">{topCategory}</span> sales.{" "}
                                {repeatRate > 30 ? (
                                    <span className="flex items-center gap-1 mt-1 font-medium text-emerald-700">
                                        <Users className="h-3.5 w-3.5" /> High customer retention ({repeatRate.toFixed(1)}%) is boosting your stability.
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 mt-1 font-medium text-amber-700">
                                        <TrendingDown className="h-3.5 w-3.5" /> Focus on repeat buyer strategies to stabilize long-term revenue.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
