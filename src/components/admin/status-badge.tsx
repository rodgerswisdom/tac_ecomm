import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  label: string
  variant?: "success" | "warning" | "danger" | "info"
}

const colors = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  info: "bg-blue-100 text-blue-800",
}

export function StatusBadge({ label, variant = "info" }: StatusBadgeProps) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", colors[variant])}>{label}</span>
}
