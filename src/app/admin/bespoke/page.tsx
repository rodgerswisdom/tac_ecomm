import Link from "next/link"
import { BespokeRequestStatus } from "@prisma/client"
import { Mail, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getBespokeRequests } from "@/server/admin/bespoke"
import { StatusBadge } from "@/components/admin/status-badge"
import { AutoSubmitSelect } from "@/app/admin/products/AutoSubmitSelect"
import { AdminPageHeader } from "@/components/admin/page-header"

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
  const page = Math.max(Number(parseParam(params?.page) ?? "1") || 1, 1)
  const pageSize = Math.min(Math.max(Number(parseParam(params?.pageSize) ?? "10") || 10, 5), 50)
  const status = parseParam(params?.status) as BespokeRequestStatus | undefined
  const search = parseParam(params?.q)

  const { requests, total, pageCount } = await getBespokeRequests({
    page,
    pageSize,
    status,
    search: search ?? undefined,
  })

  const baseQuery = new URLSearchParams()
  if (status) baseQuery.set("status", status)
  if (search) baseQuery.set("q", search)
  if (pageSize) baseQuery.set("pageSize", pageSize.toString())

  const buildPageHref = (pageNumber: number) => {
    const q = new URLSearchParams(baseQuery)
    q.set("page", pageNumber.toString())
    return `/admin/bespoke?${q.toString()}`
  }

  const hasActiveFilters = Boolean(status || search)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Bespoke requests"
        breadcrumb={[{ label: "Bespoke requests", href: "/admin/bespoke" }]}
        toolbar={
          <div className="flex w-full flex-wrap items-end gap-4">
            <form className="relative flex-1 min-w-[200px] max-w-sm" action="/admin/bespoke">
              <input type="hidden" name="pageSize" value={pageSize} />
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="status" value={status ?? ""} />
              <label htmlFor="bespoke-search" className="sr-only">
                Search by name or email
              </label>
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b98b5e]" />
              <Input
                id="bespoke-search"
                name="q"
                placeholder="Search by name or email..."
                defaultValue={search ?? ""}
                className="h-10 rounded-full border border-transparent bg-white/95 pl-12 pr-6 text-base text-[#4a2b28] shadow-[0_14px_36px_rgba(74,43,40,0.18)] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#4b9286]/35"
              />
            </form>
            <div className="ml-auto flex items-center gap-3 min-w-[200px] max-w-[260px]">
              <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status</p>
              <AutoSubmitSelect
                action="/admin/bespoke"
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
          <CardTitle className="text-base">Consultation requests ({total})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Requests from the Bespoke Studio form. Update status and add notes from the detail page.
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
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? "No requests match the selected filters."
                      : "No bespoke requests yet."}
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">{formatDate(req.createdAt)}</td>
                    <td className="px-4 py-4 font-medium">{req.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{req.email}</span>
                      </div>
                      {req.phone ? (
                        <p className="text-xs text-muted-foreground">{req.phone}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{req.categoryLabel}</td>
                    <td className="px-4 py-4">{req.budget}</td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        label={req.status.replace(/_/g, " ")}
                        variant={statusVariantMap[req.status] ?? "info"}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Button asChild size="sm" variant="outline" className="border border-border">
                        <Link href={`/admin/bespoke/${req.id}`}>View</Link>
                      </Button>
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
              disabled={page >= (pageCount || 1)}
            >
              <Link href={buildPageHref(Math.min(page + 1, pageCount || 1))}>Next</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
