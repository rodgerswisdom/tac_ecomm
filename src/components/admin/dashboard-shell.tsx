"use client"

import { useCallback, useState, type ReactNode } from "react"
import Link from "next/link"
import { Menu, PanelLeft, Search, Settings, UserRound } from "lucide-react"
import { useCurrency } from "@/contexts/CurrencyContext"
import { CurrencyCode } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SidebarNav, type AdminNavItem } from "@/components/admin/sidebar-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"

interface AdminDashboardShellProps {
  children: ReactNode
  navItems: AdminNavItem[]
  userInitials: string
  userName: string
  userEmail: string
}

const ADMIN_CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "KSH", label: "KES" },
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
]

export function AdminDashboardShell({
  children,
  navItems,
  userEmail,
  userInitials,
  userName,
}: AdminDashboardShellProps) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { currency, setCurrency } = useCurrency()

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
    <div className="min-h-screen flex flex-col" style={pageBackgroundStyle}>
      <header className="sticky top-0 z-50 border-b border-[#a17c4d] bg-[#d8b780] text-[#3f3324] shadow-sm">
        <div className="flex w-full items-center h-16">
          <div className={cn(
            "flex items-center px-4 h-full border-r border-[#3f3324]/15 shrink-0 transition-all duration-300 relative",
            isDesktopCollapsed ? "lg:w-20 lg:px-5 justify-center" : "lg:w-64 lg:px-6"
          )}>
            {/* Desktop Border Toggle - Header */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-[60] h-7 w-7 items-center justify-center text-[#2d3b34]/40 hover:text-brand-teal transition-colors"
              title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <PanelLeft className={cn("h-4 w-4 transition-transform", isDesktopCollapsed && "rotate-180")} />
            </button>
            <Link href="/admin/overview" className={cn(
              "flex items-center gap-3 transition-opacity duration-300",
              isDesktopCollapsed ? "lg:hidden" : "opacity-100"
            )}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2d3b34]/15 bg-[#b8d3c2] text-xs font-bold text-[#2d3b34]">
                TAC
              </span>
              <span className="hidden flex-col leading-tight text-[#3f3324] lg:flex whitespace-nowrap">
                <span className="text-sm font-semibold">TAC Admin</span>
                <span className="text-xs text-[#6e5a44]">Operations Console</span>
              </span>
            </Link>

            {isDesktopCollapsed && (
              <Link href="/admin/overview" className="lg:flex hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2d3b34]/15 bg-[#b8d3c2] text-xs font-bold text-[#2d3b34]">
                TAC
              </Link>
            )}
          </div>

          <div className="flex-1 px-4 lg:px-6 h-full">
            <div className="mx-auto h-full w-full max-w-7xl flex items-center justify-between gap-4">
              <div className="flex items-center justify-start min-w-0 flex-1 gap-4">
                {/* Mobile Toggle Only */}
                <button
                  type="button"
                  aria-label="Toggle navigation"
                  className="lg:hidden rounded-xl border border-[#3f3324]/40 bg-transparent p-2 text-[#3f3324] transition hover:bg-[#e6cda3]"
                  onClick={toggleSidebar}
                >
                  <Menu className="h-5 w-5" />
                </button>

                <form
                  action="/admin/products"
                  className="hidden md:flex w-full max-w-md items-center gap-2 rounded-full border border-[#3d5d4a] bg-[#b8d3c2] px-5 py-2 text-sm text-[#2f3c34] shadow-inner"
                >
                  <Search className="h-4 w-4 opacity-50" />
                  <input
                    name="q"
                    type="search"
                    placeholder="Search resources..."
                    className="flex-1 bg-transparent text-sm placeholder:text-[#53705f] focus:outline-none"
                  />
                </form>

                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2.5 rounded-xl border border-[#3f3324]/40 bg-[#b8d3c2] text-[#3f3324] md:hidden"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 border-[#3f3324]/40 bg-[#b8d3c2] text-[#2d3b34] text-sm font-medium hover:bg-[#a9c2b0]"
                    >
                      <span className="lg:hidden">{currency}</span>
                      <span className="hidden lg:inline">{ADMIN_CURRENCY_OPTIONS.find((o) => o.code === currency)?.label ?? currency}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[100px]">
                    {ADMIN_CURRENCY_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.code}
                        onClick={() => setCurrency(opt.code)}
                        className={cn(currency === opt.code && "bg-primary/10 font-medium")}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full border border-[#3f3324]/40 bg-[#b8d3c2] p-1 text-[#3f3324] transition hover:bg-[#a9c2b0]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-semibold uppercase text-[#2d3b34]">
                        {userInitials}
                      </div>
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
                        <span className="text-sm">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ redirectTo: "/auth/signin" })}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="fixed inset-0 z-50 bg-[#d8b780] flex flex-col p-4">
            <div className="flex items-center gap-4 mb-8 text-[#3f3324]">
              <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 rounded-xl bg-black/5">
                <Menu className="h-5 w-5 rotate-90" />
              </button>
              <span className="font-semibold">Search TAC Console</span>
            </div>
            <form action="/admin/products" className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3f3324]/50" />
              <input
                name="q"
                placeholder="Search..."
                className="w-full h-14 pl-12 pr-4 bg-[#b8d3c2] border border-[#3d5d4a]/30 rounded-full text-lg focus:outline-none shadow-inner"
              />
            </form>
          </div>
        )}
      </header>

      <div className="flex flex-1 relative">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300",
            isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={closeMobileSidebar}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-background/95 transition-all duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:bg-background/70 lg:shadow-none",
            isMobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
            isDesktopCollapsed ? "lg:w-20" : "lg:w-64"
          )}
        >



          <div className="flex-1 overflow-y-auto px-4 py-6" onClick={closeMobileSidebar}>
            <SidebarNav items={navItems} condensed={isDesktopCollapsed} />
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col bg-background">
          <div className="flex-1 px-3 py-8 sm:px-4 lg:px-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </div>
          
          {/* Admin Footer */}
          <footer className="mt-auto border-t border-[#3f3324]/10 bg-background px-4 py-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-[#6e5a44] sm:flex-row">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                <p>
                  © {new Date().getFullYear()} Tac Accessories Admin. All rights reserved.
                </p>
                <span className="hidden h-3.5 w-px bg-[#3f3324]/20 sm:block" />
                <p className="text-xs font-medium tracking-wide opacity-80 text-center sm:text-left">
                  @ <a href="mailto:trulyhawona@gmail.com" className="font-bold text-[#3f3324] hover:underline" target="_blank" rel="noopener noreferrer">Simple&amp;Fascinating</a>
                </p>
              </div>
              <div className="flex gap-6">
                <Link href="/admin/settings" className="transition-colors hover:text-[#3f3324]">Settings</Link>
                <a href="mailto:support@tacaccessories.com" className="transition-colors hover:text-[#3f3324]">Help & Support</a>
                <Link href="/" className="transition-colors hover:text-[#3f3324]" target="_blank">View Storefront</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>

    </div>
  )
}

