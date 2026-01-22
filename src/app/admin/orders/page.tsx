import Link from "next/link"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { Eye, Mail, PenSquare, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatPrice } from "@/lib/utils"
import { deleteOrderAction, getOrderDetail, getOrders, updateOrderStatusAction } from "@/server/admin/orders"
import { StatusBadge } from "@/components/admin/status-badge"
import { AutoSubmitSelect } from "@/app/admin/products/AutoSubmitSelect"
import { DeleteOrderButton } from "./DeleteOrderButton"
import { AdminPageHeader } from "@/components/admin/page-header"

interface OrdersPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

const statusOptions = Object.values(OrderStatus)
const rowsPerPageOptions = [10, 20, 30, 50] as const

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

const orderDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatOrderDate(date: Date | string) {
  return orderDateFormatter.format(new Date(date))
}

function getPageNumbers(current: number, total: number, maxCount = 3) {
  const clampedTotal = Math.max(total, 1)
  const half = Math.floor(maxCount / 2)
  let start = Math.max(current - half, 1)
  let end = start + maxCount - 1

  if (end > clampedTotal) {
    end = clampedTotal
    start = Math.max(end - maxCount + 1, 1)
  }

  const pages: number[] = []
  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  return pages
}

type OrdersListItem = Awaited<ReturnType<typeof getOrders>>["orders"][number] & {
  user?: {
    name?: string | null
    email?: string | null
  } | null
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) ?? {}
  const page = Math.max(Number(parseParam(params?.page) ?? "1") || 1, 1)
  const pageSize = Math.min(Math.max(Number(parseParam(params?.pageSize) ?? "10") || 10, 5), 50)
  const status = parseParam(params?.status)
  const search = parseParam(params?.q)
  const orderId = parseParam(params?.orderId)

  const [orders, selectedOrder] = await Promise.all([
    getOrders({
      page,
      pageSize,
      status: status as OrderStatus | undefined,
      search: search ?? undefined,
    }),
    orderId ? getOrderDetail(orderId) : Promise.resolve(null),
  ])

  const ordersWithRelations = orders.orders as OrdersListItem[]

  const baseQuery = new URLSearchParams()
  if (status) baseQuery.set("status", status)
  if (search) baseQuery.set("q", search)
  if (pageSize) baseQuery.set("pageSize", pageSize.toString())

  const buildPageHref = (pageNumber: number) => {
    const q = new URLSearchParams(baseQuery)
    q.set("page", pageNumber.toString())
    return `/admin/orders?${q.toString()}`
  }

  const pageNumbers = getPageNumbers(page, orders.pageCount || 1, 3)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All orders"
        breadcrumb={["Dashboard", "All orders"]}
        description="Monitor fulfillment and payments."
        toolbar={
          <form className="flex w-full flex-wrap items-center gap-3" action="/admin/orders">
            <input type="hidden" name="pageSize" value={pageSize} />
            <input type="hidden" name="page" value="1" />
            <div className="relative w-full max-w-md flex-1">
              <label htmlFor="order-search" className="sr-only">
                Search orders
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="order-search"
                name="q"
                placeholder="Search orders..."
                defaultValue={search ?? ""}
                className="pl-9"
              />
            </div>
            <div className="min-w-[180px]">
              <label htmlFor="order-status" className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <select
                id="order-status"
                name="status"
                defaultValue={status ?? ""}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ").toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm" className="h-10">
              Apply
            </Button>
          </form>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.total})</CardTitle>
          <p className="text-sm text-muted-foreground">Track fulfillment, payments, and client context at a glance.</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Order #</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Total Price (KES)</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Payment Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {ordersWithRelations.map((order) => {
                const params = new URLSearchParams(baseQuery)
                params.set("page", String(page))
                params.set("orderId", order.id)
                return (
                  <tr key={order.id} className="align-middle">
                    <td className="py-4 font-semibold tracking-tight">{order.orderNumber}</td>
                    <td className="py-4 text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</td>
                    <td className="py-4">
                      <div className="font-medium">{order.user?.name ?? "Customer"}</div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{order.user?.email ?? "Not provided"}</span>
                      </p>
                    </td>
                    <td className="py-4 font-semibold">{formatPrice(order.total, "KES")}</td>
                    <td className="py-4">
                      <StatusBadge
                        label={order.status.replace(/_/g, " ")}
                        variant={orderStatusVariantMap[order.status] ?? "info"}
                      />
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        label={order.paymentStatus.replace(/_/g, " ")}
                        variant={paymentStatusVariantMap[order.paymentStatus] ?? "info"}
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 border border-border" aria-label="Edit order">
                          <Link href={`/admin/orders?${params.toString()}`}>
                            <PenSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 border border-border" aria-label="View order">
                          <Link href={`/admin/orders?${params.toString()}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteOrderButton
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          deleteOrder={deleteOrderAction}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <AutoSubmitSelect
              action="/admin/orders"
              name="pageSize"
              defaultValue={String(pageSize)}
              options={rowsPerPageOptions.map((value) => ({ label: String(value), value: String(value) }))}
              selectClassName="w-20 rounded-md border border-border bg-transparent px-2 py-1 text-sm"
              hiddenFields={{
                status: status ?? undefined,
                q: search ?? undefined,
                page: "1",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="h-9 px-3 border border-border" disabled={page <= 1}>
              <Link href={buildPageHref(Math.max(page - 1, 1))}>Prev</Link>
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                asChild
                size="sm"
                variant="ghost"
                className={cn(
                  "h-9 w-9 border",
                  pageNumber === page ? "border-white bg-white text-background" : "border-border text-muted-foreground",
                )}
              >
                <Link href={buildPageHref(pageNumber)}>{pageNumber}</Link>
              </Button>
            ))}
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-9 px-3 border border-border"
              disabled={page >= (orders.pageCount || 1)}
            >
              <Link href={buildPageHref(Math.min(page + 1, orders.pageCount || 1))}>Next</Link>
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
                        {option.replace(/_/g, " ").toLowerCase()}
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
                        {option.replace(/_/g, " ").toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <Textarea name="note" placeholder="Internal note" defaultValue={selectedOrder.notes ?? ""} />
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
