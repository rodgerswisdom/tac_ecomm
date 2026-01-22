import Link from "next/link"
import Image from "next/image"
import { Download, Eye, PenSquare, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn, formatPrice } from "@/lib/utils"
import { deleteProductAction, getProductList } from "@/server/admin/products"
import { AutoSubmitSelect } from "./AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"

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
type ProductImagePreview = {
  url: string
  alt?: string | null
  order?: number | null
}
type ProductListItem = Awaited<ReturnType<typeof getProductList>>["items"][number] & {
  images?: ProductImagePreview[]
  category?: {
    name?: string | null
  } | null
  shortDescription?: string | null
}

const MAX_PAGE_BUTTONS = 5

function parseSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function clampPageSize(value?: string | null) {
  const parsed = Number(value)
  if (!parsed || Number.isNaN(parsed)) return 10
  return Math.min(Math.max(parsed, 5), 50)
}

function isValidSort(value: string | undefined): value is SortOption {
  return SORT_OPTIONS.some((option) => option.value === value)
}

function buildQueryString(base: URLSearchParams, overrides: Record<string, string | number | undefined>) {
  const params = new URLSearchParams(base)
  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
  })
  return params.toString()
}

function truncateText(value: string | null | undefined, maxLength = 80) {
  if (!value) return ""
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1)}…`
}

function getPrimaryImage(product: ProductListItem) {
  if (!product.images || product.images.length === 0) return undefined
  let primary = product.images[0]
  let primaryOrder = primary?.order ?? 0
  for (let i = 1; i < product.images.length; i += 1) {
    const candidate = product.images[i]
    if (!candidate) continue
    const candidateOrder = candidate.order ?? primaryOrder
    if (candidateOrder < primaryOrder) {
      primary = candidate
      primaryOrder = candidateOrder
    }
  }
  return primary
}

function getDiscountPercent(product: ProductListItem) {
  const { comparePrice, price } = product
  if (!comparePrice || comparePrice <= price) return null
  const percent = ((comparePrice - price) / comparePrice) * 100
  return Math.round(percent * 10) / 10
}

function getProductSummary(product: ProductListItem) {
  return truncateText(product.shortDescription ?? product.description ?? "", 80)
}

function getStatus(product: ProductListItem) {
  const inStock = product.stock > 0 && product.isActive
  return {
    label: inStock ? "In stock" : "Out of stock",
    dotClass: inStock ? "bg-emerald-500" : "bg-rose-500",
    textClass: inStock ? "text-emerald-600" : "text-rose-600",
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {}
  const page = Math.max(Number(parseSearchParam(params.page) ?? "1") || 1, 1)
  const search = parseSearchParam(params.q) ?? ""
  const categoryId = parseSearchParam(params.categoryId)
  const sortParam = parseSearchParam(params.sort)
  const sort: SortOption = isValidSort(sortParam) ? sortParam : "recent"
  const pageSize = clampPageSize(parseSearchParam(params.pageSize))

  const products = await getProductList({
    page,
    search,
    categoryId: categoryId ?? undefined,
    pageSize,
    sort,
  })
  const productItems = products.items as ProductListItem[]

  const baseParams = new URLSearchParams()
  if (search) baseParams.set("q", search)
  if (categoryId) baseParams.set("categoryId", categoryId)
  baseParams.set("sort", sort)
  baseParams.set("pageSize", String(pageSize))

  const totalPages = Math.max(products.pageCount, 1)
  const halfWindow = Math.floor(MAX_PAGE_BUTTONS / 2)
  let startPage = Math.max(1, products.page - halfWindow)
  const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1)
  if (endPage - startPage + 1 < MAX_PAGE_BUTTONS) {
    startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1)
  }
  const pageNumbers = []
  for (let i = startPage; i <= endPage; i += 1) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All products"
        breadcrumb={["Dashboard", "All products"]}
        description="Review inventory, availability, and pricing at a glance."
        actions={
          <>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" /> Add a product
              </Link>
            </Button>
          </>
        }
        toolbar={
          <div className="flex w-full flex-wrap items-center justify-between gap-4">
            
            <form action="/admin/products" className="relative w-full max-w-md flex-1">
              <label htmlFor="product-search" className="sr-only">
                Search products by name or SKU
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="product-search"
                name="q"
                defaultValue={search}
                placeholder="Search e.g. PRD-2024-001 or Heritage Cuff"
                className="pl-9"
              />
              <input type="hidden" name="sort" value={sort} />
              <input type="hidden" name="pageSize" value={pageSize} />
              {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
            </form>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Sort by</span>
              <AutoSubmitSelect
                action="/admin/products"
                name="sort"
                defaultValue={sort}
                options={SORT_OPTIONS}
                hiddenFields={{ q: search, pageSize, categoryId }}
                className="rounded-md border border-input bg-background px-3 py-2"
                selectClassName="w-full text-sm focus:outline-none"
              />
            </div>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Products ({products.total})</CardTitle>
          <p className="text-sm text-muted-foreground">Showing {productItems.length} of {products.total} items</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="border-b border-r border-border/40 bg-muted/40 py-3 px-2 font-medium">Product</th>
                <th className="border-b border-r border-border/40 bg-muted/40 py-3 px-2 font-medium">Price</th>
                <th className="border-b border-r border-border/40 bg-muted/40 py-3 px-2 font-medium">Discount (%)</th>
                <th className="border-b border-r border-border/40 bg-muted/40 py-3 px-2 font-medium">Description</th>
                <th className="border-b border-r border-border/40 bg-muted/40 py-3 px-2 font-medium">Quantity</th>
                <th className="border-b border-r border-border/40 bg-muted/40 py-3 px-2 font-medium">Status</th>
                <th className="border-b border-border/40 bg-muted/40 py-3 px-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No products match the current filters.
                  </td>
                </tr>
              ) : (
                productItems.map((product) => {
                  const primaryImage = getPrimaryImage(product)
                  const discountPercent = getDiscountPercent(product)
                  const summary = getProductSummary(product)
                  const status = getStatus(product)
                  return (
                    <tr key={product.id} className="align-middle">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={primaryImage.alt ?? product.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-muted-foreground">
                                {product.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{product.name}</div>
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-l border-border/40 py-4 font-semibold">{formatPrice(product.price, "KES")}</td>
                      <td className="border-l border-border/40 py-4">
                        {discountPercent != null ? (
                          <span className="font-medium text-emerald-600">{discountPercent}%</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="border-l border-border/40 py-4 text-sm text-muted-foreground">{summary || "—"}</td>
                      <td className="border-l border-border/40 py-4 font-medium">{product.stock}</td>
                      <td className="border-l border-border/40 py-4">
                        <span className={cn("inline-flex items-center gap-2 text-sm font-medium", status.textClass)}>
                          <span className={cn("h-2 w-2 rounded-full", status.dotClass)} />
                          {status.label}
                        </span>
                      </td>
                      <td className="border-l border-border/40 py-4 text-right">
                        <div className="ml-auto flex w-fit items-center gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View product">
                            <Link href={`/admin/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit product">
                            <Link href={`/admin/products/${product.id}`}>
                              <PenSquare className="h-4 w-4" />
                            </Link>
                          </Button>
                          <form action={deleteProductAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600"
                              aria-label="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              </tbody>
            </table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <AutoSubmitSelect
            action="/admin/products"
            name="pageSize"
            defaultValue={String(pageSize)}
            options={PAGE_SIZE_OPTIONS.map((size) => ({ label: String(size), value: size }))}
            hiddenFields={{ q: search, sort, categoryId }}
            className="rounded-md border border-input bg-background px-2 py-1"
            selectClassName="text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={products.page <= 1}
          >
            <Link href={`/admin/products?${buildQueryString(baseParams, { page: products.page - 1 })}`}>
              Prev
            </Link>
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              asChild
              variant={pageNumber === products.page ? "default" : "outline"}
              size="sm"
            >
              <Link href={`/admin/products?${buildQueryString(baseParams, { page: pageNumber })}`}>
                {pageNumber}
              </Link>
            </Button>
          ))}
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={products.page >= totalPages}
          >
            <Link href={`/admin/products?${buildQueryString(baseParams, { page: products.page + 1 })}`}>
              Next
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
