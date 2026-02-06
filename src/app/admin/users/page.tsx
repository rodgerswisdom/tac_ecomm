import Link from "next/link"
import { Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getUsersSummary, deleteUserAction } from "@/server/admin/users"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AutoSubmitSelect } from "@/app/admin/products/AutoSubmitSelect"
import { RowActions } from "@/components/admin/row-actions"


const rowsPerPageOptions = [10, 20, 30, 50] as const

interface UsersPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "User"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "US"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

function formatUserCode(id: string) {
  const tail = id.slice(-5).toUpperCase()
  return `USR-${tail}`
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = (await searchParams) ?? {}
  const search = parseParam(params?.q) ?? ""
  const page = Math.max(Number(parseParam(params?.page) ?? "1") || 1, 1)
  const pageSize = Math.min(Math.max(Number(parseParam(params?.pageSize) ?? "10") || 10, 5), 50)

  const {
    users,
    total,
    pageCount,
    page: currentPage,
    pageSize: currentPageSize,
  } = await getUsersSummary({
    search: search.trim() ? search.trim() : undefined,
    page,
    pageSize,
  })

  const hasActiveFilters = Boolean(search.trim())

  const baseQuery = new URLSearchParams()
  if (search) baseQuery.set("q", search)
  baseQuery.set("pageSize", String(currentPageSize))

  const buildPageHref = (pageNumber: number) => {
    const q = new URLSearchParams(baseQuery)
    q.set("page", pageNumber.toString())
    return `/admin/users?${q.toString()}`
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users"
        description="Review customer behavior and roles."
        breadcrumb={[
          { label: "Users", href: "/admin/users" },
        ]}
        actionsAlignment="end"
        actions={
          <div className="flex flex-wrap items-end justify-end gap-3">
            <Button
              asChild
              className="h-10 rounded-full bg-[#4a2b28] px-5 text-[#f2dcb8] shadow-[0_10px_24px_rgba(74,43,40,0.25)] transition hover:bg-[#3d221f]"
            >
              <Link href="/admin/users/new" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                <UserPlus className="h-4 w-4" aria-hidden="true" /> Add User
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Users ({total})</CardTitle>
              {/* <span className="text-sm text-muted-foreground">Showing {total} of {total} </span> */}

            </div>
            
            <form action="/admin/users" className="relative min-w-[220px] max-w-sm">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="pageSize" value={currentPageSize} />
              <label htmlFor="user-search" className="sr-only">
                Search users
              </label>
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b98b5e]" />
              <Input
                id="user-search"
                name="q"
                defaultValue={search}
                placeholder="Search..."
                className="h-10 rounded-full border border-transparent bg-white/95 pl-12 pr-6 text-base text-[#4a2b28] shadow-[0_14px_36px_rgba(74,43,40,0.18)] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#4b9286]/35"
              />
            </form>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Name</th>
                <th className="px-4 py-3 text-left text-xs">Email</th>
                <th className="px-4 py-3 text-left text-xs">Role</th>
                <th className="px-4 py-3 text-left text-xs">Orders</th>
                <th className="px-4 py-3 text-left text-xs">Status</th>
                <th className="px-4 py-3 text-left text-xs">Created</th>
                <th className="px-4 py-3 text-left text-xs">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {hasActiveFilters ? "No users match the current search." : "No users have been created yet."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted text-sm font-medium">
                          {getInitials(user.name, user.email)}
                        </div>
                        <div>
                          <p className="font-medium text-[#3b2b21]">{user.name ?? "Customer"}</p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground" title={user.id}>
                            {formatUserCode(user.id)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-4 capitalize">{user.role.toLowerCase()}</td>
                    <td className="px-4 py-4">{user._count?.orders ?? 0}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-[#e6f5ec] text-[#2b6148]"
                            : "bg-[#fdf0eb] text-[#8b3a2b]"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <RowActions
                        viewHref={`/admin/users/${user.id}`}
                        editHref={`/admin/users/${user.id}`}
                        deleteConfig={{
                          action: deleteUserAction,
                          fields: { id: user.id },
                          resourceLabel: user.name ?? user.email ?? "User",
                          confirmTitle: `Delete ${user.name ?? "this user"}?`,
                          confirmDescription: "This action cannot be undone.",
                          confirmButtonLabel: "Delete User",
                        }}
                      />
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
              action="/admin/users"
              name="pageSize"
              defaultValue={String(currentPageSize)}
              options={rowsPerPageOptions.map((size) => ({ label: String(size), value: String(size) }))}
              selectClassName="rounded-md border border-border bg-transparent px-2 py-1"
              hiddenFields={{
                q: search || undefined,
                page: "1",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm" 
              variant="ghost"
              disabled={currentPage <= 1}
            >
              <Link href={buildPageHref(Math.max(currentPage - 1, 1))}>Prev</Link>
            </Button>
            <span>
              {currentPage}
            </span>
            <Button asChild size="sm" variant="ghost" disabled={currentPage >= pageCount}>
              <Link href={buildPageHref(Math.min(currentPage + 1, pageCount))}>Next</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
