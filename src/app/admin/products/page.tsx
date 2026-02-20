import Link from "next/link"
import Image from "next/image"
import { Download, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AdminFormattedPrice } from "@/components/admin/admin-formatted-price"
import { getProductList } from "@/server/admin/products"
import { deleteProductAction } from "@/server/admin/product-actions"
import { AutoSubmitSelect } from "./AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"

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

function getPrimaryImage(p: ProductListItem) {
  if (!p.images?.length) return undefined
  return [...p.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
}

function getDiscountPercent(p: ProductListItem) {
  if (!p.comparePrice || p.comparePrice <= p.price) return null
  return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
}

function getStatus(p: ProductListItem) {
  if (p.isDraft) {
    return {
      label: "Draft",
      dot: "bg-amber-500",
      text: "text-amber-600",
    }
  }
  const inStock = p.stock > 0 && p.isActive
  return {
    label: inStock ? "In stock" : "Out of stock",
    dot: inStock ? "bg-emerald-500" : "bg-rose-500",
    text: inStock ? "text-emerald-600" : "text-rose-600",
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {}

  const page = Math.max(Number(parseParam(params.page) ?? 1), 1)
  const search = parseParam(params.q) ?? ""
  const sortParam = parseParam(params.sort)
  const sort: SortOption = isValidSort(sortParam) ? sortParam : "recent"
  const pageSize = clampPageSize(parseParam(params.pageSize))

  const products = await getProductList({ page, search, sort, pageSize })
  const items = products.items as ProductListItem[]

  const baseParams = new URLSearchParams()
  if (search) baseParams.set("q", search)
  baseParams.set("sort", sort)
  baseParams.set("pageSize", String(pageSize))

  const totalPages = Math.max(products.pageCount, 1)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All products"
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
            </form>

            {/* Sort aligned right */}
            <AutoSubmitSelect
              action="/admin/products"
              name="sort"
              defaultValue={sort}
              options={SORT_OPTIONS}
              hiddenFields={{ q: search, pageSize }}
              className="rounded-md border px-3 py-2"
              selectClassName="text-sm"
            />
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Products ({products.total})</CardTitle>
          <span className="text-sm text-muted-foreground">
            Showing {items.length} of {products.total}
          </span>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Product</th>
                <th className="px-4 py-3 text-left text-xs">Category</th>
                <th className="px-4 py-3 text-left text-xs">Price</th>
                <th className="px-4 py-3 text-left text-xs">Stock</th>
                <th className="px-4 py-3 text-left text-xs">Status</th>
                <th className="px-4 py-3 text-right text-xs">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((product) => {
                const image = getPrimaryImage(product)
                const discount = getDiscountPercent(product)
                const status = getStatus(product)

                return (
                  <tr key={product.id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
                          {image ? (
                            <Image src={image.url} alt={product.name} width={40} height={40} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs">
                              {product.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            {product.isDraft ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-900">
                                Draft
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {product.category?.name ?? "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        <AdminFormattedPrice amount={product.price} />
                      </div>
                      {discount && (
                        <div className="text-xs text-emerald-600">
                          {discount}% off
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">{product.stock}</td>

                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center gap-2", status.text)}>
                        <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                        {status.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <RowActions
                        viewHref={`/admin/products/${product.id}`}
                        editHref={`/admin/products/${product.id}`}
                        deleteConfig={{
                          action: deleteProductAction,
                          fields: { productId: product.id },
                          resourceLabel: product.name,
                          confirmTitle: `Delete ${product.name}?`,
                          confirmDescription: `This will permanently remove ${product.name}.`,
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
              hiddenFields={{ q: search || undefined, sort, page: "1" }}
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
