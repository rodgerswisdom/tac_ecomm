"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
  Heart,
  Settings,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/Navbar"
import type { DashboardStats, OrderListItem } from "@/server/actions/dashboard-actions"
import {
  formatOrderStatus,
  formatPaymentStatus,
  getOrderStatusColor,
  formatOrderDate,
  formatCurrency,
  getRelativeTime,
} from "@/lib/order-utils"
import { cn } from "@/lib/utils"

interface DashboardClientProps {
  stats: DashboardStats
  recentOrders: OrderListItem[]
  userName: string
}

export function DashboardClient({
  stats,
  recentOrders,
  userName,
}: DashboardClientProps) {
  const memberSinceFormatted = formatOrderDate(stats.memberSince)

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All time",
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Lifetime value",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "In progress",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Delivered",
    },
  ]

  const quickActions = [
    {
      title: "All Orders",
      description: "View complete order history",
      icon: Package,
      href: "/profile/orders",
      color: "text-blue-600",
    },
    {
      title: "Wishlist",
      description: "View saved items",
      icon: Heart,
      href: "/wishlist",
      color: "text-pink-600",
    },
    {
      title: "Account Settings",
      description: "Manage your account",
      icon: Settings,
      href: "/profile/settings",
      color: "text-gray-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="gallery-container nav-clearance section-spacing max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold luxury-heading mb-2">
              Welcome back, <span className="afro-text-gradient">{userName}</span>
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Member since {memberSinceFormatted}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Recent Orders
                      </CardTitle>
                      <CardDescription>Your latest order activity</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/profile/orders">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        You haven't placed any orders yet
                      </p>
                      <Button asChild>
                        <Link href="/products">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => {
                        const firstItem = order.items[0]
                        const firstItemName = firstItem?.product?.name || "Item"
                        const moreItemsCount = order.items.length - 1

                        return (
                          <Link
                            key={order.id}
                            href={`/profile/orders/${order.orderNumber}`}
                            className="block"
                          >
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="text-sm font-semibold">
                                      {order.orderNumber}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        getOrderStatusColor(order.status)
                                      )}
                                    >
                                      {formatOrderStatus(order.status)}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {firstItemName}
                                    {moreItemsCount > 0 &&
                                      ` +${moreItemsCount} more`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getRelativeTime(order.createdAt)} · {order.itemCount}{" "}
                                    item{order.itemCount === 1 ? "" : "s"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold mb-1">
                                    {formatCurrency(order.total, order.currency)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatPaymentStatus(order.paymentStatus)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Button
                          asChild
                          variant="outline"
                          className="w-full h-auto py-4 justify-start"
                        >
                          <Link href={action.href}>
                            <div
                              className={cn(
                                "p-2 rounded-lg bg-muted mr-3",
                                action.color
                              )}
                            >
                              <action.icon className="h-5 w-5" />
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-medium text-sm">
                                {action.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {action.description}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Account Summary */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Account Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-medium">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium">{memberSinceFormatted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Made with Bob
