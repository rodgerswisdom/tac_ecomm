"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Mail, MessageSquare, Package, Receipt, Settings, Tags, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type AdminNavIcon = "overview" | "products" | "categories" | "orders" | "users" | "analytics" | "settings" | "bespoke" | "communication"

const iconMap: Record<AdminNavIcon, LucideIcon> = {
  overview: LayoutDashboard,
  products: Package,
  categories: Tags,
  orders: Receipt,
  users: Users,
  analytics: Activity,
  settings: Settings,
  bespoke: MessageSquare,
  communication: Mail,
}

export type AdminNavItem = {
  label: string
  href: string
  icon: AdminNavIcon
}

interface SidebarNavProps {
  items: AdminNavItem[]
  condensed?: boolean
}

export function SidebarNav({ items, condensed = false }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          const navLink = (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "group flex items-center rounded-xl py-2 text-sm font-medium transition-colors",
                condensed ? "justify-center gap-0 px-2" : "gap-3 px-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-lg bg-background text-foreground shadow-sm",
                  condensed ? "h-10 w-10" : "h-8 w-8"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {!condensed ? <span className="whitespace-nowrap">{item.label}</span> : null}
            </Link>
          )

          if (condensed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {navLink}
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return navLink
        })}
      </nav>
    </TooltipProvider>
  )
}
