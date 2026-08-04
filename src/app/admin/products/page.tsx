import Link from "next/link"
import { Archive, Download, Package, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getProductList } from "@/server/admin/products"
import { AutoSubmitSelect } from "./AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProductTable } from "./ProductTable"

interface ProductsPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

const SORT_OPTIONS = [
  { label: "Newest", value: "recent" },
  { label: "Price: Low to high", value: "priceAsc" },
  { label: "Price: High to low", value: "priceDesc" },
  { label: "Stock: High to low", value: "stockDesc" },
  { label: "Stock: Low to high", value: "stockAsc" },
] as const

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const
type SortOption = (typeof SORT_OPTIONS)[number]["value"]

type ProductListItem = Awaited<ReturnType<typeof getProductList>>["items"][number] & {
  images?: { url: string; alt?: string | null; order?: number | null }[]
  category?: { name?: string | null } | null
  currency?: string | null
}

// const MAX_PAGE_BUTTONS = 5

function parseParam(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v
}

function clampPageSize(value?: string | null) {
  const n = Number(value)
  if (!n || Number.isNaN(n)) return 10
  return Math.min(Math.max(n, 5), 50)
}

function isValidSort(v?: string): v is SortOption {
  return SORT_OPTIONS.some((o) => o.value === v)
}

function buildQueryString(base: URLSearchParams, overrides: Record<string, string | number | undefined>) {
  const params = new URLSearchParams(base)
  Object.entries(overrides).forEach(([k, v]) => {
    if (v == null) params.delete(k)
    else params.set(k, String(v))
  })
  return params.toString()
}

type ProductTab = "active" | "archived"

function parseTab(value?: string): ProductTab {
  return value === "archived" ? "archived" : "active"
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {}

  const page = Math.max(Number(parseParam(params.page) ?? 1), 1)
  const search = parseParam(params.q) ?? ""
  const sortParam = parseParam(params.sort)
  const sort: SortOption = isValidSort(sortParam) ? sortParam : "recent"
  const pageSize = clampPageSize(parseParam(params.pageSize))
  const tab = parseTab(parseParam(params.tab))
  const isArchivedTab = tab === "archived"

  const products = await getProductList({
    page,
    search,
    sort,
    pageSize,
    archived: isArchivedTab,
  })
  const items = products.items as ProductListItem[]

  const baseParams = new URLSearchParams()
  if (search) baseParams.set("q", search)
  baseParams.set("sort", sort)
  baseParams.set("pageSize", String(pageSize))
  if (isArchivedTab) baseParams.set("tab", "archived")

  const tabHiddenFields = {
    q: search || undefined,
    sort,
    pageSize: String(pageSize),
    tab: isArchivedTab ? "archived" : undefined,
  }

  const totalPages = Math.max(products.pageCount, 1)

  const tabLink = (target: ProductTab) => {
    const query = buildQueryString(baseParams, {
      tab: target === "archived" ? "archived" : undefined,
      page: 1,
    })
    return `/admin/products${query ? `?${query}` : ""}`
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={isArchivedTab ? "Archived products" : "All products"}
        breadcrumb={[{ label: "products", href: "/admin/products" }]}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" /> Add product
              </Link>
            </Button>
          </>
        }
        toolbar={
          <div className="flex w-full items-center justify-between gap-4">
            {/* Search */}
            <form action="/admin/products" className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-3 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search}
                placeholder="Search by name or SKU"
                className="pl-10"
              />
              <input type="hidden" name="sort" value={sort} />
              <input type="hidden" name="pageSize" value={pageSize} />
              {isArchivedTab && <input type="hidden" name="tab" value="archived" />}
            </form>

            {/* Sort aligned right */}
            <AutoSubmitSelect
              action="/admin/products"
              name="sort"
              defaultValue={sort}
              options={SORT_OPTIONS}
              hiddenFields={tabHiddenFields}
              className="rounded-md border px-3 py-2"
              selectClassName="text-sm"
            />
          </div>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base">
              {isArchivedTab ? "Archived" : "Active"} products ({products.total})
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Showing {items.length} of {products.total}
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
            <Link
              href={tabLink("active")}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                !isArchivedTab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Package className="h-4 w-4" />
              Active
            </Link>
            <Link
              href={tabLink("archived")}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isArchivedTab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Archive className="h-4 w-4" />
              Archived
            </Link>
          </div>
          {isArchivedTab ? (
            <p className="text-sm text-muted-foreground">
              Out-of-stock products are no longer archived automatically. Unarchive a product here to show it on the site with an Out of stock badge and notify-me option.
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          <ProductTable products={items as any} view={tab} />
        </CardContent>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
          {/* Pagination restored */}
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <AutoSubmitSelect
              action="/admin/products"
              name="pageSize"
              defaultValue={String(pageSize)}
              options={PAGE_SIZE_OPTIONS.map((n) => ({ label: String(n), value: n }))}
              hiddenFields={{ ...tabHiddenFields, page: "1" }}
              selectClassName="rounded-md border border-border bg-transparent px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" disabled={page <= 1}>
                <Link href={`/admin/products?${buildQueryString(baseParams, { page: page - 1 })}`}>
                  Prev
                </Link>
              </Button>
              <span>
                {page}
              </span>
              <Button asChild size="sm" variant="ghost" disabled={page >= totalPages}>
                <Link href={`/admin/products?${buildQueryString(baseParams, { page: page + 1, totalPages })}`}>
                  Next
                </Link>
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
