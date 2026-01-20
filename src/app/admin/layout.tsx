import type { ReactNode } from "react"
import Link from "next/link"
import { Store } from "lucide-react"
import { requireAdmin } from "@/server/admin/auth"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import type { AdminNavItem } from "@/components/admin/sidebar-nav"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin()

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
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 border-r border-border bg-background/60 px-4 py-6 lg:block">
        <Link href="/admin/overview" className="flex items-center gap-2 px-3 py-2 text-lg font-semibold">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">TAC</span>
          <span>Admin</span>
        </Link>
        <div className="mt-8">
          <SidebarNav items={navItems} />
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-semibold">{session.user?.name ?? session.user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/">
                  <Store className="mr-2 h-4 w-4" />
                  View store
                </Link>
              </Button>
              <form action="/api/auth/signout" method="post">
                <Button type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
