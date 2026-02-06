"use client"

import { useCallback, useState, type ReactNode } from "react"
import Link from "next/link"
import { Menu, Search, Settings, UserRound } from "lucide-react"
import { SidebarNav, type AdminNavItem } from "@/components/admin/sidebar-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface AdminDashboardShellProps {
  children: ReactNode
  navItems: AdminNavItem[]
  userInitials: string
  userName: string
  userEmail: string
}

export function AdminDashboardShell({
  children,
  navItems,
  userEmail,
  userInitials,
  userName,
}: AdminDashboardShellProps) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pageBackgroundStyle = {
    backgroundColor: "#dfe7d9",
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), rgba(223,231,217,0) 55%)," +
      "radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25), rgba(223,231,217,0) 40%)," +
      "radial-gradient(circle at 0% 70%, rgba(255,255,255,0.2), rgba(223,231,217,0) 35%)",
  }

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev)
    } else {
      setIsDesktopCollapsed((prev) => !prev)
    }
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen" style={pageBackgroundStyle}>
      <header className="sticky top-0 z-30 border-b border-[#a17c4d] bg-[#d8b780] text-[#3f3324] shadow-sm">
        <div className="flex w-full flex-wrap items-center gap-4 px-4 py-3 lg:flex-nowrap lg:px-8">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/admin/overview" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#2d3b34]/15 bg-[#b8d3c2] text-base font-semibold text-[#2d3b34]">
                TAC
              </span>
              <span className="flex flex-col leading-tight text-[#3f3324]">
                <span className="text-sm font-semibold">TAC Admin</span>
                <span className="text-xs text-[#6e5a44]">Operations Console</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isMobileSidebarOpen || isDesktopCollapsed}
              className="rounded-full border border-[#3f3324]/40 bg-transparent p-2 text-[#3f3324] transition hover:bg-[#e6cda3]"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <form
            action="/admin/products"
            role="search"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#3d5d4a] bg-[#b8d3c2] px-5 py-2 text-sm text-[#2f3c34] shadow-inner max-w-full sm:max-w-sm"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <label htmlFor="global-search" className="sr-only">
              Search admin content
            </label>
            <input
              id="global-search"
              name="q"
              type="search"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-[#2f3c34] placeholder:text-[#53705f] focus:outline-none"
            />
            <input type="hidden" name="sort" value="recent" />
          </form>

          <div className="ml-auto flex items-center gap-4 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Open profile menu for ${userName}`}
                  className="flex items-center gap-2 rounded-full border border-[#3f3324]/40 bg-[#b8d3c2] p-1 text-[#3f3324] transition hover:bg-[#a9c2b0]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-semibold uppercase text-[#2d3b34]">
                    {userInitials}
                  </div>
                  <span className="sr-only">
                    {userName} ({userEmail}) profile menu
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    <span className="text-sm">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/signout" method="post" className="w-full">
                    <button type="submit" className="flex w-full items-center gap-2 text-left">
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {isMobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={closeMobileSidebar}
            aria-hidden
          />
        ) : null}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-border bg-background/95 px-4 py-6 text-foreground shadow-lg transition-all duration-200 lg:sticky lg:top-[4.25rem] lg:h-[calc(100vh-4.25rem)] lg:bg-background/70 lg:shadow-none",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            isDesktopCollapsed ? "lg:w-20 lg:px-2" : "lg:w-64"
          )}
        >
          <div className="flex-1 overflow-y-auto" onClick={closeMobileSidebar}>
            <SidebarNav items={navItems} condensed={isDesktopCollapsed} />
          </div>
          <Link
            href="/admin/overview"
            className="mt-6 flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-semibold text-foreground"
          >
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">TAC</span>
            {!isDesktopCollapsed ? <span className="text-muted-foreground">Admin Panel</span> : null}
          </Link>
        </aside>

        <main className="flex-1 bg-background px-3 py-8 text-foreground sm:px-4 lg:px-6">
          <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
