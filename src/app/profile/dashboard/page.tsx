import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import {
  getDashboardStats,
  getRecentOrders,
} from "@/server/actions/dashboard-actions"
import { DashboardClient } from "./DashboardClient"

export const metadata = {
  title: "Dashboard | TAC E-commerce",
  description: "View your order statistics and recent activity",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
  ])

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load dashboard data</p>
      </div>
    )
  }

  return (
    <DashboardClient
      stats={stats}
      recentOrders={recentOrders}
      userName={session.user.name || "User"}
    />
  )
}

// Made with Bob
