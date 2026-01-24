import Link from "next/link"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { Mail, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn, formatPrice } from "@/lib/utils"
import { deleteOrderAction, getOrders } from "@/server/admin/orders"
import { StatusBadge } from "@/components/admin/status-badge"
import { AutoSubmitSelect } from "@/app/admin/products/AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"

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

  const pageNumbers = getPageNumbers(page, orders.pageCount || 1, 3)
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
                <th className="pb-2 font-medium">Total price</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Payment Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
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
                      <td className="py-4 font-semibold">{formatPrice(order.total, order.currency ?? "USD")}</td>
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
                        <RowActions
                          containerClassName="justify-end gap-2"
                          buttonClassName="border border-border"
                          deleteButtonClassName="border border-border text-rose-500 hover:text-rose-600"
                          viewHref={detailHref}
                          editHref={`${detailHref}#status-update`}
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
    </div>
  )
}
