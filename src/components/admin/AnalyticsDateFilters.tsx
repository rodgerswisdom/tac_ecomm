"use client"

import { useEffect, useRef } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const DATE_PRESETS = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
    { label: "Last year", value: "365" },
    { label: "All time", value: "1000" },
]

interface AnalyticsDateFiltersProps {
    currentDays: string
    action: string
}

export function AnalyticsDateFilters({ currentDays, action }: AnalyticsDateFiltersProps) {
    const formRef = useRef<HTMLFormElement>(null)
    const router = useRouter()

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        formRef.current?.requestSubmit()
    }

    return (
        <form ref={formRef} action={action} className="flex items-center gap-3">
            <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-teal/60 transition-colors group-hover:text-brand-teal" />
                <select
                    name="days"
                    value={currentDays}
                    onChange={handlePresetChange}
                    className={cn(
                        "h-10 w-[180px] rounded-full border border-brand-teal/15 bg-white pl-10 pr-10 text-sm font-black text-brand-umber shadow-sm transition-all hover:border-brand-teal/30 focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/5 cursor-pointer appearance-none"
                    )}
                >
                    {DATE_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                            {preset.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-teal/60 pointer-events-none" />
            </div>
        </form>
    )
}
