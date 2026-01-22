import type { ReactNode } from "react"
import { requireAdmin } from "@/server/admin/auth"
import type { AdminNavItem } from "@/components/admin/sidebar-nav"
import { AdminDashboardShell } from "@/components/admin/dashboard-shell"

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
  }
  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase()
  }
  return "AD"
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin()
  const userName = session.user?.name ?? session.user?.email ?? "Admin User"
  const userEmail = session.user?.email ?? "admin@example.com"
  const userInitials = getInitials(session.user?.name, session.user?.email)

  const navItems: AdminNavItem[] = [
    { label: "Overview", href: "/admin/overview", icon: "overview" },
    { label: "Products", href: "/admin/products", icon: "products" },
    { label: "Categories", href: "/admin/categories", icon: "categories" },
    { label: "Orders", href: "/admin/orders", icon: "orders" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
    { label: "Settings", href: "/admin/settings", icon: "settings" },
  ]

  return (
    <AdminDashboardShell
      navItems={navItems}
      userEmail={userEmail}
      userInitials={userInitials}
      userName={userName}
    >
      {children}
    </AdminDashboardShell>
  )
}
