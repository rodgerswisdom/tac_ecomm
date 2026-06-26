"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
} from "lucide-react"
import { OrderStatus } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navbar } from "@/components/Navbar"
import { getFilteredOrders } from "@/server/actions/dashboard-actions"
import type { OrderListItem } from "@/server/actions/dashboard-actions"
import {
  formatOrderStatus,
  formatPaymentStatus,
  getOrderStatusColor,
  formatOrderDate,
  formatCurrency,
} from "@/lib/order-utils"
import { cn } from "@/lib/utils"

export function OrdersListClient() {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  
  // Filters
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    loadOrders()
  }, [status, sortBy, page])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const result = await getFilteredOrders({
        status: status,
        sortBy,
        page,
        limit,
        search: search.trim(),
      })
      setOrders(result.orders)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadOrders()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const totalPages = Math.ceil(total / limit)

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
            <div className="flex items-center gap-2 mb-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile/dashboard">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold luxury-heading mb-2">
              My <span className="afro-text-gradient">Orders</span>
            </h1>
            <p className="text-muted-foreground">
              View and track all your orders
            </p>
          </div>

          {/* Filters */}
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by order number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-9"
                      />
                    </div>
                    <Button onClick={handleSearch} size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Filter */}
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value as OrderStatus | "ALL")
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Orders</SelectItem>
                    <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                    <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                    <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                    <SelectItem value={OrderStatus.REFUNDED}>Refunded</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value as "newest" | "oldest")
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-muted-foreground">
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    Showing {orders.length} of {total} order{total === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Orders
              </CardTitle>
              <CardDescription>
                Click on an order to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No orders found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {search
                      ? "Try adjusting your search or filters"
                      : "You haven't placed any orders yet"}
                  </p>
                  {!search && (
                    <Button asChild>
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => {
                    const firstItem = order.items[0]
                    const firstItemImage = firstItem?.product?.images?.[0]
                    const firstItemName = firstItem?.product?.name || "Item"
                    const moreItemsCount = order.items.length - 1

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Link
                          href={`/profile/orders/${order.orderNumber}`}
                          className="block"
                        >
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                            <div className="flex gap-4">
                              {/* Product Image */}
                              {firstItemImage && (
                                <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                                  <Image
                                    src={firstItemImage}
                                    alt={firstItemName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              {/* Order Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
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
                                    <p className="text-xs text-muted-foreground">
                                      {formatOrderDate(order.createdAt)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold">
                                      {formatCurrency(order.total, order.currency)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatPaymentStatus(order.paymentStatus)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">
                                    {firstItemName}
                                    {moreItemsCount > 0 &&
                                      ` +${moreItemsCount} more`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && orders.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasMore}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

