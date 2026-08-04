import Link from "next/link"
import Image from "next/image"
import { BespokeRequestStatus } from "@prisma/client"
import { Mail, Search, Phone, Package, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getBespokeCatalogProducts, getBespokeRequests } from "@/server/admin/bespoke"
import { StatusBadge } from "@/components/admin/status-badge"
import { AutoSubmitSelect } from "@/app/admin/products/AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"
import { BespokeProductRowActions } from "./BespokeProductRowActions"
import { cn, formatPrice } from "@/lib/utils"

interface BespokePageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

const statusOptions = Object.values(BespokeRequestStatus)
const statusFilterOptions = [
  { label: "All statuses", value: "" },
  ...statusOptions.map((option) => ({
    label: option.replace(/_/g, " ").toLowerCase(),
    value: option,
  })),
] as const
const rowsPerPageOptions = [10, 20, 30, 50] as const

const statusVariantMap: Record<BespokeRequestStatus, "success" | "warning" | "danger" | "info"> = {
  NEW: "warning",
  CONTACTED: "info",
  IN_PROGRESS: "info",
  QUOTED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDate(date: Date | string) {
  return dateFormatter.format(new Date(date))
}

export default async function AdminBespokePage({ searchParams }: BespokePageProps) {
  const params = (await searchParams) ?? {}
  const tab = parseParam(params?.tab) === "products" ? "products" : "requests"
  const page = Math.max(Number(parseParam(params?.page) ?? "1") || 1, 1)
  const pageSize = Math.min(Math.max(Number(parseParam(params?.pageSize) ?? "10") || 10, 5), 50)
  const status = parseParam(params?.status) as BespokeRequestStatus | undefined
  const search = parseParam(params?.q)

  const requestsData =
    tab === "requests"
      ? await getBespokeRequests({
          page,
          pageSize,
          status,
          search: search ?? undefined,
        })
      : null

  const productsData =
    tab === "products"
      ? await getBespokeCatalogProducts({
          page,
          pageSize,
          search: search ?? undefined,
        })
      : null

  const baseQuery = new URLSearchParams()
  baseQuery.set("tab", tab)
  if (status && tab === "requests") baseQuery.set("status", status)
  if (search) baseQuery.set("q", search)
  if (pageSize) baseQuery.set("pageSize", pageSize.toString())

  const buildPageHref = (pageNumber: number) => {
    const q = new URLSearchParams(baseQuery)
    q.set("page", pageNumber.toString())
    return `/admin/bespoke?${q.toString()}`
  }

  const tabHref = (nextTab: "requests" | "products") => {
    const q = new URLSearchParams()
    q.set("tab", nextTab)
    q.set("page", "1")
    q.set("pageSize", String(pageSize))
    return `/admin/bespoke?${q.toString()}`
  }

  const hasActiveFilters = Boolean(status || search)
  const total = tab === "requests" ? requestsData?.total ?? 0 : productsData?.total ?? 0
  const pageCount = tab === "requests" ? requestsData?.pageCount ?? 1 : productsData?.pageCount ?? 1

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Bespoke"
        breadcrumb={[{ label: "Bespoke", href: "/admin/bespoke" }]}
        toolbar={
          <div className="flex w-full flex-wrap items-end gap-4">
            <form className="relative w-full min-w-0 flex-1 sm:min-w-[200px] sm:max-w-sm" action="/admin/bespoke">
              <input type="hidden" name="tab" value={tab} />
              <input type="hidden" name="pageSize" value={pageSize} />
              <input type="hidden" name="page" value="1" />
              {tab === "requests" ? <input type="hidden" name="status" value={status ?? ""} /> : null}
              <label htmlFor="bespoke-search" className="sr-only">
                {tab === "requests" ? "Search by name or email" : "Search products"}
              </label>
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b98b5e]" />
              <Input
                id="bespoke-search"
                name="q"
                placeholder={tab === "requests" ? "Search by name or email..." : "Search by name or SKU..."}
                defaultValue={search ?? ""}
                className="h-10 rounded-full border border-transparent bg-white/95 pl-12 pr-6 text-base text-[#4a2b28] shadow-[0_14px_36px_rgba(74,43,40,0.18)] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#4b9286]/35"
              />
            </form>
            {tab === "requests" ? (
              <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto sm:min-w-[200px] sm:max-w-[260px]">
                <p className="whitespace-nowrap text-xs font-medium text-muted-foreground">Status</p>
                <AutoSubmitSelect
                  action="/admin/bespoke"
                  name="status"
                  defaultValue={status ?? ""}
                  options={statusFilterOptions}
                  selectClassName="w-full rounded-full border border-[#d8b685] bg-[#f8ebd2] px-4 py-2 text-sm text-[#4a2b28] shadow-[0_4px_12px_rgba(74,43,40,0.12)]"
                  hiddenFields={{
                    tab: "requests",
                    q: search ?? undefined,
                    pageSize: String(pageSize),
                    page: "1",
                  }}
                />
              </div>
            ) : (
              <Button asChild className="sm:ml-auto">
                <Link href="/admin/products/new?bespoke=1">Add bespoke product</Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
        <Link
          href={tabHref("requests")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "requests"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Requests
        </Link>
        <Link
          href={tabHref("products")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "products"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Package className="h-4 w-4" />
          Products
        </Link>
      </div>

      {tab === "requests" && requestsData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consultation requests ({total})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Requests from the Bespoke & Limited Edition commission form. Update status and notes from the detail page.
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs">Date</th>
                  <th className="px-4 py-3 text-left text-xs">Name</th>
                  <th className="px-4 py-3 text-left text-xs">Contact</th>
                  <th className="px-4 py-3 text-left text-xs">Category</th>
                  <th className="px-4 py-3 text-left text-xs">Budget</th>
                  <th className="px-4 py-3 text-left text-xs">Status</th>
                  <th className="px-4 py-3 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requestsData.requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      {hasActiveFilters
                        ? "No requests match the selected filters."
                        : "No bespoke requests yet."}
                    </td>
                  </tr>
                ) : (
                  requestsData.requests.map((req) => (
                    <tr key={req.id} className="border-b last:border-b-0">
                      <td className="px-4 py-4">{formatDate(req.createdAt)}</td>
                      <td className="px-4 py-4 font-medium">{req.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{req.email}</span>
                        </div>
                        <br />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{req.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{req.categoryLabel}</td>
                      <td className="px-4 py-4">{req.budget}</td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          label={req.status.replace(/_/g, " ")}
                          variant={statusVariantMap[req.status] ?? "info"}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <RowActions viewHref={`/admin/bespoke/${req.id}`} viewLabel="View request" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <AutoSubmitSelect
                action="/admin/bespoke"
                name="pageSize"
                defaultValue={String(pageSize)}
                options={rowsPerPageOptions.map((value) => ({ label: String(value), value: String(value) }))}
                selectClassName="rounded-md border border-border bg-transparent px-2 py-1"
                hiddenFields={{
                  tab: "requests",
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
              <span>{page}</span>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="h-9 border border-border px-3"
                disabled={page >= pageCount}
              >
                <Link href={buildPageHref(Math.min(page + 1, pageCount))}>Next</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === "products" && productsData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bespoke & Limited Edition products ({total})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Products marked as bespoke. These appear only on the Bespoke & Limited Edition shop, not in
              regular collections. Use Add bespoke product to create one here, or move an existing product
              from the products list.
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs">Product</th>
                  <th className="px-4 py-3 text-left text-xs">SKU</th>
                  <th className="px-4 py-3 text-left text-xs">Category</th>
                  <th className="px-4 py-3 text-left text-xs">Price</th>
                  <th className="px-4 py-3 text-left text-xs">Stock</th>
                  <th className="px-4 py-3 text-left text-xs">Status</th>
                  <th className="px-4 py-3 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsData.products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      {search
                        ? "No bespoke products match your search."
                        : "No bespoke products yet. Add a bespoke product to get started."}
                    </td>
                  </tr>
                ) : (
                  productsData.products.map((product) => (
                    <tr key={product.id} className="border-b last:border-b-0">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            {product.images[0]?.url ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">{product.sku}</td>
                      <td className="px-4 py-4">{product.category?.name ?? "—"}</td>
                      <td className="px-4 py-4">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4">{product.stock}</td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          label={
                            product.isArchived
                              ? "Archived"
                              : product.isDraft
                                ? "Draft"
                                : product.isActive
                                  ? "Active"
                                  : "Inactive"
                          }
                          variant={
                            product.isArchived
                              ? "danger"
                              : product.isDraft
                                ? "warning"
                                : product.isActive
                                  ? "success"
                                  : "info"
                          }
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <BespokeProductRowActions productId={product.id} productSlug={product.slug} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <AutoSubmitSelect
                action="/admin/bespoke"
                name="pageSize"
                defaultValue={String(pageSize)}
                options={rowsPerPageOptions.map((value) => ({ label: String(value), value: String(value) }))}
                selectClassName="rounded-md border border-border bg-transparent px-2 py-1"
                hiddenFields={{
                  tab: "products",
                  q: search ?? undefined,
                  page: "1",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" disabled={page <= 1}>
                <Link href={buildPageHref(Math.max(page - 1, 1))}>Prev</Link>
              </Button>
              <span>{page}</span>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="h-9 border border-border px-3"
                disabled={page >= pageCount}
              >
                <Link href={buildPageHref(Math.min(page + 1, pageCount))}>Next</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
