import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { deleteCategoryAction, getCategories } from "@/server/admin/categories"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AutoSubmitSelect } from "../products/AutoSubmitSelect"
import { RowActions } from "@/components/admin/row-actions"

interface CategoriesPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "nameAsc" },
  { label: "Name (Z-A)", value: "nameDesc" },
  { label: "Most products", value: "productsDesc" },
  { label: "Fewest products", value: "productsAsc" },
] as const

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const
type SortOption = (typeof SORT_OPTIONS)[number]["value"]

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function clampPageSize(raw?: string | null) {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return 10
  return Math.min(Math.max(parsed, 5), 50)
}

function sortCategories<T extends Awaited<ReturnType<typeof getCategories>>>(categories: T, sort: SortOption) {
  const list = [...categories]
  switch (sort) {
    case "nameDesc":
      return list.sort((a, b) => b.name.localeCompare(a.name))
    case "productsDesc":
      return list.sort((a, b) => b._count.products - a._count.products)
    case "productsAsc":
      return list.sort((a, b) => a._count.products - b._count.products)
    case "nameAsc":
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name))
  }
}

function getInitials(label: string) {
  const trimmed = label.trim()
  if (!trimmed) return "--"
  const [first, last] = trimmed.split(" ")
  if (!last) return trimmed.slice(0, 2).toUpperCase()
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = (await searchParams) ?? {}
  const allCategories = await getCategories()
  const search = parseParam(params?.q) ?? ""
  const sortParam = parseParam(params?.sort)
  const sort: SortOption = SORT_OPTIONS.some((option) => option.value === sortParam)
    ? (sortParam as SortOption)
    : "nameAsc"
  const pageSize = clampPageSize(parseParam(params?.pageSize))
  const page = Math.max(Number(parseParam(params?.page) ?? "1") || 1, 1)

  const filtered = allCategories.filter((category) => {
    const needle = search.trim().toLowerCase()
    if (!needle) return true
    return (
      category.name.toLowerCase().includes(needle) ||
      category.slug.toLowerCase().includes(needle) ||
      (category.parent?.name?.toLowerCase().includes(needle) ?? false)
    )
  })

  const sortedCategories = sortCategories(filtered, sort)
  const total = sortedCategories.length
  const pageCount = Math.max(Math.ceil(total / pageSize), 1)
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize
  const visibleCategories = sortedCategories.slice(startIndex, startIndex + pageSize)

  const baseParams = new URLSearchParams()
  if (search) baseParams.set("q", search)
  baseParams.set("sort", sort)
  baseParams.set("pageSize", String(pageSize))

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(baseParams)
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    return `/admin/categories?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All categories"
        description="Browse, filter, and manage your merchandising taxonomy."
        breadcrumb={[
          { label: "Categories", href: "/admin/categories" },
        ]}
        actions={
          <Button asChild size="sm" className="gap-2">
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4" /> Add a category
            </Link>
          </Button>
        }
        toolbar={
          <div className="flex w-full flex-wrap items-center gap-3">
            <form action="/admin/categories" className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="category-search"
                name="q"
                defaultValue={search}
                placeholder="Search categories..."
                className="pl-9"
              />
              <input type="hidden" name="sort" value={sort} />
              <input type="hidden" name="pageSize" value={pageSize} />
              <input type="hidden" name="page" value="1" />
            </form>
            <div className="ml-auto flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Sort by</span>
              <AutoSubmitSelect
                action="/admin/categories"
                name="sort"
                defaultValue={sort}
                options={SORT_OPTIONS}
                hiddenFields={{ q: search || undefined, pageSize: String(pageSize), page: "1" }}
                className="rounded-md border border-input bg-background px-2 py-1"
                selectClassName="text-sm focus:outline-none"
              />
            </div>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Categories ({filtered.length})</CardTitle>
              <span className="text-sm text-muted-foreground">Showing {visibleCategories.length} of {filtered.length} </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Category</th>
                <th className="px-4 py-3 text-left text-xs">Slug</th>
                <th className="px-4 py-3 text-left text-xs">Number of products</th>
                <th className="px-4 py-3 text-left text-xs">Parent category</th>
                <th className="px-4 py-3 text-left text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No categories match the current filters.
                  </td>
                </tr>
              ) : (
                visibleCategories.map((category) => (
                  <tr key={category.id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted text-xs font-semibold uppercase">
                          {getInitials(category.name)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.description ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{category.slug}</td>
                    <td className="px-4 py-4">{category._count.products}</td>
                    <td className="px-4 py-4">{category.parent?.name ?? "—"}</td>
                    <td className="px-4 py-4">
                      <RowActions
                        viewHref={`/collections/${category.slug}`}
                        viewLinkProps={{ target: "_blank", rel: "noopener noreferrer" }}
                        editHref={`/admin/categories?categoryId=${category.id}`}
                        deleteConfig={{
                          action: deleteCategoryAction,
                          fields: { categoryId: category.id },
                          resourceLabel: category.name,
                          confirmTitle: `Delete ${category.name}?`,
                          confirmDescription: `This will permanently remove ${category.name} and detach its products.`,
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <AutoSubmitSelect
              action="/admin/categories"
              name="pageSize"
              defaultValue={String(pageSize)}
              options={PAGE_SIZE_OPTIONS.map((size) => ({ label: String(size), value: size }))}
              hiddenFields={{ q: search || undefined, sort, page: "1" }}
              selectClassName="rounded-md border border-border bg-transparent px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="ghost"
              disabled={currentPage <= 1}
            >
              <Link href={buildHref({ page: Math.max(currentPage - 1, 1) })}>
                Prev
              </Link>
            </Button>
            <span>
              {currentPage}
            </span>
            <Button
              asChild
              size="sm"
              variant="ghost"
              disabled={currentPage >= pageCount}
            >
              <Link href={buildHref({ page: Math.min(currentPage + 1, pageCount) })}>
                Next
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
