"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Package, Receipt, Settings, Tags, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type AdminNavIcon = "overview" | "products" | "categories" | "orders" | "users" | "analytics" | "settings"

const iconMap: Record<AdminNavIcon, LucideIcon> = {
  overview: LayoutDashboard,
  products: Package,
  categories: Tags,
  orders: Receipt,
  users: Users,
  analytics: Activity,
  settings: Settings,
}

export type AdminNavItem = {
  label: string
  href: string
  icon: AdminNavIcon
}

interface SidebarNavProps {
  items: AdminNavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = iconMap[item.icon] ?? LayoutDashboard
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
