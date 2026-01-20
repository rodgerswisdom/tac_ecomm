import Link from "next/link"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from "@/lib/utils"
import { getOrderDetail, getOrders, updateOrderStatusAction } from "@/server/admin/orders"

interface OrdersPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

const statusOptions = Object.values(OrderStatus)

type OrdersListItem = Awaited<ReturnType<typeof getOrders>>["orders"][number] & {
  user?: {
    name?: string | null
    email?: string | null
  } | null
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) ?? {}
  const page = Math.max(Number(parseParam(params?.page) ?? "1") || 1, 1)
  const status = parseParam(params?.status)
  const search = parseParam(params?.q)
  const orderId = parseParam(params?.orderId)

  const [orders, selectedOrder] = await Promise.all([
    getOrders({ page, status: status as OrderStatus | undefined, search: search ?? undefined }),
    orderId ? getOrderDetail(orderId) : Promise.resolve(null),
  ])

  const ordersWithRelations = orders.orders as OrdersListItem[]

  const query = new URLSearchParams()
  if (status) query.set("status", status)
  if (search) query.set("q", search)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">Monitor fulfillment and payments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">Search</label>
              <Input className="mt-2" name="q" placeholder="Order number or customer" defaultValue={search ?? ''} />
            </div>
            <div className="min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select
                name="status"
                defaultValue={status ?? ''}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.total})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Created</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {ordersWithRelations.map((order) => {
                const params = new URLSearchParams(query)
                params.set("orderId", order.id)
                return (
                  <tr key={order.id} className="align-middle">
                    <td className="py-3 font-medium">{order.orderNumber}</td>
                    <td className="py-3">
                      <div className="font-medium">{order.user?.name ?? 'Customer'}</div>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </td>
                    <td className="py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="py-3 capitalize">{order.status.toLowerCase()}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/orders?${params.toString()}`}>Manage</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
        <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-muted-foreground">
          <span>
            Page {orders.page} of {orders.pageCount || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" disabled={orders.page <= 1}>
              <Link
                href={`/admin/orders?${(() => {
                  const params = new URLSearchParams(query)
                  params.set("page", String(Math.max(orders.page - 1, 1)))
                  return params.toString()
                })()}`}
              >
                Previous
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" disabled={orders.page >= orders.pageCount}>
              <Link
                href={`/admin/orders?${(() => {
                  const params = new URLSearchParams(query)
                  params.set("page", String(Math.min(orders.page + 1, orders.pageCount || 1)))
                  return params.toString()
                })()}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOrder ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3 rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold">Summary</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd className="font-medium">{selectedOrder.user?.name ?? 'Customer'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-semibold">{formatPrice(selectedOrder.total)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Payment</dt>
                    <dd className="capitalize">{selectedOrder.paymentStatus.toLowerCase()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd>{selectedOrder.shippingMethod ?? 'Standard'}</dd>
                  </div>
                </dl>
                <div className="text-sm">
                  <p className="text-muted-foreground">Shipping address</p>
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p className="font-medium">
                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      </p>
                      <p>{selectedOrder.shippingAddress.address1}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm">Address unavailable</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Items</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {selectedOrder.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.product?.name ?? 'Product'}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-4 rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold">Update status</h3>
                <form action={updateOrderStatusAction} className="space-y-3">
                  <input type="hidden" name="orderId" value={selectedOrder.id} />
                  <select
                    name="status"
                    defaultValue={selectedOrder.status}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, ' ').toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <select
                    name="paymentStatus"
                    defaultValue={selectedOrder.paymentStatus}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Object.values(PaymentStatus).map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, ' ').toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <Textarea name="note" placeholder="Internal note" defaultValue={selectedOrder.notes ?? ''} />
                  <Button type="submit">Save update</Button>
                </form>
                <div>
                  <h4 className="font-semibold">Payments</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {selectedOrder.payments.map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between">
                        <span>
                          {payment.method.toLowerCase()} · {payment.status.toLowerCase()}
                        </span>
                        <span className="font-medium">{formatPrice(payment.amount)}</span>
                      </li>
                    ))}
                    {selectedOrder.payments.length === 0 && (
                      <li className="text-muted-foreground">No payment records.</li>
                    )}
                  </ul>
                </div>
              </section>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an order to view its details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
