import Link from "next/link"
import { notFound } from "next/navigation"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { getOrderDetail } from "@/server/admin/orders"
import { StatusUpdateForm } from "./StatusUpdateForm"

interface OrderDetailPageProps {
  params: { orderId: string }
}

const orderStatusVariantMap: Record<OrderStatus, "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
}

const paymentStatusVariantMap: Record<PaymentStatus, "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
  REFUNDED: "info",
  CANCELLED: "danger",
}

const orderStatusOptions = Object.values(OrderStatus)
const paymentStatusOptions = Object.values(PaymentStatus)

const orderDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatOrderDate(date: Date | string) {
  return orderDateFormatter.format(new Date(date))
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = params
  const order = await getOrderDetail(orderId)

  if (!order) {
    notFound()
  }

  const currency = order.currency ?? "KES"
  const address = order.shippingAddress
  const customerName = [address?.firstName, address?.lastName].filter(Boolean).join(" ") || order.user?.name || "Customer"

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        breadcrumb={[
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNumber ?? "Details", href: `/admin/orders/${order.id}` },
        ]}
        description={`Placed ${formatOrderDate(order.createdAt)}`}
        toolbar={
          <div className="flex w-full flex-wrap items-center gap-3">
            <StatusBadge
              label={order.status.replace(/_/g, " ")}
              variant={orderStatusVariantMap[order.status] ?? "info"}
            />
            <StatusBadge
              label={order.paymentStatus.replace(/_/g, " ")}
              variant={paymentStatusVariantMap[order.paymentStatus] ?? "info"}
            />
            <Button asChild variant="ghost" size="sm" className="ml-auto border border-border">
              <Link href="/admin/orders">Back to orders</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order overview</CardTitle>
            <p className="text-sm text-muted-foreground">Customer context, line items, and payment activity.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="text-base font-semibold">{order.user?.name ?? "Customer"}</p>
                <p className="text-muted-foreground">{order.user?.email ?? "No email provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order number</p>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-muted-foreground">Tracking {order.trackingNumber ?? "Not assigned"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Placed on</p>
                <p className="font-semibold">{formatOrderDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment method</p>
                <p className="font-semibold">{order.paymentMethod ?? "Unspecified"}</p>
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="text-base font-semibold">{formatPrice(order.subtotal, currency)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Shipping</p>
                <p className="text-base font-semibold">{formatPrice(order.shipping, currency)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Tax</p>
                <p className="text-base font-semibold">{formatPrice(order.tax, currency)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Total</p>
                <p className="text-base font-semibold">{formatPrice(order.total, currency)}</p>
              </div>
            </div>

            {order.notes ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Internal note</p>
                <p className="font-medium text-foreground">{order.notes}</p>
              </div>
            ) : null}

            <section>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items</h4>
                <p className="text-sm text-muted-foreground">{order.items.length} total</p>
              </div>
              <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-white">
                {order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
                      <div>
                        <p className="font-semibold">{item.product?.name ?? "Product"}</p>
                        <p className="text-xs text-muted-foreground">SKU {item.product?.sku ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-xs text-muted-foreground">Unit</p>
                        <p className="font-semibold">{formatPrice(item.price, currency)}</p>
                        <p className="text-xs text-muted-foreground">Subtotal</p>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity, currency)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">No line items recorded.</p>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payments</h4>
              <div className="mt-3 space-y-3">
                {order.payments.length > 0 ? (
                  order.payments.map((payment) => (
                    <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-3 text-sm">
                      <div>
                        <p className="font-semibold capitalize">
                          {payment.method.toLowerCase()} · {payment.status.toLowerCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatOrderDate(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-base font-semibold">{formatPrice(payment.amount, payment.currency)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No payment records yet.
                  </p>
                )}
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Shipping details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {address ? (
                <>
                  <div className="space-y-1">
                    <p className="font-semibold">{customerName}</p>
                    <p>{address.address1}</p>
                    {address.address2 ? <p>{address.address2}</p> : null}
                    <p>
                      {address.city}
                      {address.state ? `, ${address.state}` : ""}
                    </p>
                    <p>{address.country}</p>
                    {address.phone ? <p className="text-muted-foreground">Phone {address.phone}</p> : null}
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Shipping method</p>
                    <p className="font-semibold">{order.shippingMethod ?? "Not assigned"}</p>
                    {order.trackingNumber ? (
                      <p className="text-xs text-muted-foreground">Tracking {order.trackingNumber}</p>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No shipping address captured.</p>
              )}
            </CardContent>
          </Card>

          <Card id="status-update">
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusUpdateForm
                orderId={order.id}
                defaultStatus={order.status}
                defaultPaymentStatus={order.paymentStatus}
                defaultNote={order.notes}
                statusOptions={orderStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
