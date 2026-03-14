import Link from "next/link"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { CheckCircle, Clock, HelpCircle, Mail, Search, XCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminFormattedPrice } from "@/components/admin/admin-formatted-price"
import { deleteOrderAction, getOrders } from "@/server/admin/orders"
import { StatusBadge } from "@/components/admin/status-badge"
import { AutoSubmitSelect } from "@/app/admin/products/AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"
import { formatPrice } from "@/lib/utils"

interface OrdersPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

const statusOptions = Object.values(OrderStatus)
const statusFilterOptions = [
  { label: "All statuses", value: "" },
  ...statusOptions.map((option) => ({
    label: option.replace(/_/g, " ").toLowerCase(),
    value: option,
  })),
] as const
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
  const orders = await getOrders({
    page,
    pageSize,
    status: status as OrderStatus | undefined,
    search: search ?? undefined,
  })

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

  const hasActiveFilters = Boolean(status || search)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All orders"
        breadcrumb={[
          { label: "Orders", href: "/admin/orders" },
        ]}
        toolbar={
          <div className="flex w-full flex-wrap items-end gap-4">
            <form className="relative flex-1 min-w-[200px] max-w-sm" action="/admin/orders">
              <input type="hidden" name="pageSize" value={pageSize} />
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="status" value={status ?? ""} />
              <label htmlFor="order-search" className="sr-only">
                Search orders
              </label>
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b98b5e]" />
              <Input
                id="order-search"
                name="q"
                placeholder="Search orders..."
                defaultValue={search ?? ""}
                className="h-10 rounded-full border border-transparent bg-white/95 pl-12 pr-6 text-base text-[#4a2b28] shadow-[0_14px_36px_rgba(74,43,40,0.18)] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#4b9286]/35"
              />
            </form>
            <div className="ml-auto flex items-center gap-3 min-w-[200px] max-w-[260px]">
              <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status</p>
              <AutoSubmitSelect
                action="/admin/orders"
                name="status"
                defaultValue={status ?? ""}
                options={statusFilterOptions}
                selectClassName="w-full rounded-full border border-[#d8b685] bg-[#f8ebd2] px-4 py-2 text-sm text-[#4a2b28] shadow-[0_4px_12px_rgba(74,43,40,0.12)]"
                hiddenFields={{
                  q: search ?? undefined,
                  pageSize: String(pageSize),
                  page: "1",
                }}
              />
            </div>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders ({orders.total})</CardTitle>
          <p className="text-sm text-muted-foreground">Track fulfillment, payments, and client context at a glance.</p>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Order #</th>
                <th className="px-4 py-3 text-left text-xs">Date</th>
                <th className="px-4 py-3 text-left text-xs">Client</th>
                <th className="px-4 py-3 text-left text-xs">Total price</th>
                <th className="px-4 py-3 text-left text-xs">Status</th>
                <th className="px-4 py-3 text-left text-xs">Payment Status</th>
                <th className="px-4 py-3 text-left text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersWithRelations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {hasActiveFilters ? "No orders match the selected filters." : "No orders have been captured yet."}
                  </td>
                </tr>
              ) : (
                ordersWithRelations.map((order) => {
                  const detailHref = `/admin/orders/${order.id}`
                  return (
                    <tr key={order.id} className="border-b last:border-b-0">
                      <td className="px-4 py-4 ">{order.orderNumber}</td>
                      <td className="px-4 py-4 ">{formatOrderDate(order.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{order.user?.name ?? "Customer"}</div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{order.user?.email ?? "Not provided"}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3 "><AdminFormattedPrice amount={order.total} amountCurrency={order.currency === "USD" ? undefined : order.currency} /></td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor:
                              order.status === "CONFIRMED"
                                ? "#e7f0fa"
                                : order.status === "PENDING"
                                  ? "#fef3c7"
                                  : order.status === "CANCELLED"
                                    ? "#fde2e1"
                                    : order.status === "PROCESSING"
                                      ? "#e7f0fa"
                                      : order.status === "SHIPPED"
                                        ? "#dcfce7"
                                        : "#f3f4f6",
                            color:
                              order.status === "CONFIRMED"
                                ? "#2563eb"
                                : order.status === "PENDING"
                                  ? "#92400e"
                                  : order.status === "CANCELLED"
                                    ? "#b91c1c"
                                    : order.status === "PROCESSING"
                                      ? "#25baebff"
                                      : order.status === "SHIPPED"
                                        ? "#108a3cff"
                                        : "#374151",
                          }}
                        >
                          {(() => {
                            switch (order.status) {
                              case "CONFIRMED":
                                return <><CheckCircle className="h-3 w-3 text-blue-500 inline mr-1" />Confirmed</>;
                              case "PENDING":
                                return <><Clock className="h-3 w-3 text-amber-500 inline mr-1" />Pending</>;
                              case "CANCELLED":
                                return <><XCircle className="h-3 w-3 text-rose-500 inline mr-1" />Cancelled</>;
                              case "PROCESSING":
                                return <><Clock className="h-3 w-3 text-blue-500 inline mr-1" />Processing</>;
                              case "SHIPPED":
                                return <><Truck className="h-3 w-3 text-green-500 inline mr-1" />Shipped</>;
                              default:
                                return <><HelpCircle className="h-3 w-3 text-slate-400 inline mr-1" />{order.status}</>;
                            }
                          })()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          label={order.paymentStatus.replace(/_/g, " ")}
                          variant={paymentStatusVariantMap[order.paymentStatus] ?? "info"}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <RowActions
                          containerClassName="justify-end gap-2"
                          buttonClassName="border border-border"
                          deleteButtonClassName="border border-border text-rose-500 hover:text-rose-600"
                          viewHref={detailHref}
                          editHref={`${detailHref}#status-update`}
                          modalTitle={`Order ${order.orderNumber} Details`}
                          viewContent={
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer</p>
                                  <p className="font-bold text-slate-900">{order.user?.name ?? 'Guest'}</p>
                                  <p className="text-xs text-slate-500">{order.user?.email}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment Method</p>
                                  <p className="font-bold text-slate-900 capitalize">{order.paymentMethod?.replace(/_/g, ' ') || 'Not specified'}</p>
                                </div>
                              </div>

                              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Items</p>
                                </div>
                                <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto">
                                  {order.items?.map((item: any) => (
                                    <div key={item.id} className="px-4 py-3 flex items-center gap-4 text-sm">
                                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                        {item.product?.images?.[0] ? (
                                          <img src={item.product.images[0].url} alt={item.product.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-slate-200 uppercase">
                                            {item.product?.name?.slice(0, 2)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0 mr-4">
                                        <p className="font-bold text-slate-900 truncate">{item.product?.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Qty: {item.quantity} × <AdminFormattedPrice amount={item.price} amountCurrency={order.currency} /></p>
                                      </div>
                                      <p className="font-black text-slate-900 text-right">
                                        <AdminFormattedPrice amount={item.price * item.quantity} amountCurrency={order.currency} />
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-slate-50/50 px-4 py-3 space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-bold"><AdminFormattedPrice amount={order.subtotal} amountCurrency={order.currency} /></span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="font-bold text-emerald-600">+ <AdminFormattedPrice amount={order.shipping} amountCurrency={order.currency} /></span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Tax</span>
                                    <span className="font-bold text-amber-600">+ <AdminFormattedPrice amount={order.tax} amountCurrency={order.currency} /></span>
                                  </div>
                                  {order.subtotal + order.tax + order.shipping > order.total + 0.01 && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 italic">Discount Applied</span>
                                      <span className="font-bold text-rose-600">- <AdminFormattedPrice amount={(order.subtotal + order.tax + order.shipping) - order.total} amountCurrency={order.currency} /></span>
                                    </div>
                                  )}
                                  <div className="flex justify-between pt-2 border-t border-slate-200 text-base">
                                    <span className="font-black text-brand-umber uppercase tracking-widest">Total</span>
                                    <span className="font-black text-brand-umber"><AdminFormattedPrice amount={order.total} amountCurrency={order.currency} /></span>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Shipping Destination</p>
                                {order.shippingAddress ? (
                                  <div className="text-sm text-slate-600 space-y-0.5">
                                    <p className="font-semibold text-slate-800">{order.shippingAddress.address1}</p>
                                    {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                    <p className="uppercase tracking-wide font-bold text-[10px] text-slate-400 mt-1">{order.shippingAddress.country}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400 italic">No delivery address provided</p>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fulfillment</p>
                                  <StatusBadge
                                    label={order.status.replace(/_/g, " ")}
                                    variant={orderStatusVariantMap[order.status]}
                                  />
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment</p>
                                  <StatusBadge
                                    label={order.paymentStatus.replace(/_/g, " ")}
                                    variant={paymentStatusVariantMap[order.paymentStatus]}
                                  />
                                </div>
                              </div>
                            </div>
                          }
                          deleteConfig={{
                            action: deleteOrderAction,
                            fields: { orderId: order.id },
                            resourceLabel: `order ${order.orderNumber}`,
                            confirmTitle: `Delete order ${order.orderNumber}?`,
                            confirmDescription: `This will permanently remove order ${order.orderNumber} and all associated records.`,
                            confirmButtonLabel: "Delete order",
                          }}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
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
              selectClassName="rounded-md border border-border bg-transparent px-2 py-1"
              hiddenFields={{
                status: status ?? undefined,
                q: search ?? undefined,
                page: "1",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" disabled={page <= 1}>
              <Link href={buildPageHref(Math.max(page - 1, 1))}>Prev</Link>
            </Button>
            <span>
              {page}
            </span>
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
    </div>
  )
}
