"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  Download,
  Phone,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/Navbar"
import { OrderTimeline } from "@/components/OrderTimeline"
import type { OrderDetail } from "@/server/actions/dashboard-actions"
import {
  formatOrderStatus,
  formatPaymentStatus,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatOrderDateTime,
  formatCurrency,
  canCancelOrder,
} from "@/lib/order-utils"
import { cn } from "@/lib/utils"

interface OrderDetailClientProps {
  order: OrderDetail
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const canCancel = canCancelOrder(order.status)

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return
    }
    // TODO: Implement cancel order functionality
    alert("Cancel order functionality to be implemented")
  }

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
    alert("Invoice download functionality to be implemented")
  }

  const handleContactSupport = () => {
    // TODO: Implement contact support
    window.location.href = "/contact"
  }

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
                <Link href="/profile/orders">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Orders
                </Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold luxury-heading mb-2">
                  Order <span className="afro-text-gradient">{order.orderNumber}</span>
                </h1>
                <p className="text-muted-foreground">
                  Placed on {formatOrderDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn("text-sm px-3 py-1", getOrderStatusColor(order.status))}
                >
                  {formatOrderStatus(order.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1",
                    getPaymentStatusColor(order.paymentStatus)
                  )}
                >
                  {formatPaymentStatus(order.paymentStatus)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Timeline */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Status
                  </CardTitle>
                  <CardDescription>Track your order progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderTimeline status={order.status} />
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    {order.items.length} item{order.items.length === 1 ? "" : "s"} in this
                    order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 rounded-lg border border-border/60 bg-muted/20"
                      >
                        {/* Product Image */}
                        {item.product && item.product.images[0] && (
                          <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1">
                            {item.product ? (
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            ) : (
                              "Product"
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.price, order.currency)} each
                          </p>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.price * item.quantity, order.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Order Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(order.subtotal, order.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        {formatCurrency(order.tax, order.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {formatCurrency(order.shipping, order.currency)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(order.total, order.currency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.country}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="text-muted-foreground flex items-center gap-1 mt-2">
                        <Phone className="h-3 w-3" />
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">
                        {order.paymentMethod || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          getPaymentStatusColor(order.paymentStatus)
                        )}
                      >
                        {formatPaymentStatus(order.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              {(order.shippingMethod || order.trackingNumber) && (
                <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Truck className="h-5 w-5 text-primary" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      {order.shippingMethod && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium">{order.shippingMethod}</span>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div>
                          <p className="text-muted-foreground mb-1">Tracking Number</p>
                          <p className="font-mono text-xs bg-muted p-2 rounded">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Notes */}
              {order.notes && (
                <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-5 w-5 text-primary" />
                      Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleDownloadInvoice}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                    {order.trackingNumber && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a
                          href={`https://www.google.com/search?q=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Track Shipment
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleContactSupport}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                    {canCancel && (
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleCancelOrder}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </Button>
                    )}
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

