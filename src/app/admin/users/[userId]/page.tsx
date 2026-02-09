import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserDetail, updateUserRoleAction, deleteUserAction } from "@/server/admin/users"
import { RoleSettings } from "./RoleSettings"
import { DangerZoneSection } from "./DangerZoneSection"

const createdAtFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await getUserDetail(userId)

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title=""
        description={undefined}
        breadcrumb={[
          { label: "Users", href: "/admin/users" },
          { label: "User", href: `/admin/users/${user.id}` },
        ]}
        toolbar={
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground leading-tight">{user.name || user.email || "User"}</span>
              {user.email ? (
                <span className="text-sm text-muted-foreground leading-tight">{user.email}</span>
              ) : null}
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to users
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-5xl space-y-5">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Profile summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Name</p>
              <div>
                <p className="font-semibold">{user.name ?? "Customer"}</p>
                {/* {user.email ? <p className="text-xs text-muted-foreground">{user.email}</p> : null} */}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Role</p>
              <p className="font-semibold capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Status</p>
              <p className="font-semibold">{user.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Orders</p>
              <p className="font-semibold">{user._count.orders}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Created</p>
              <p className="font-semibold">{createdAtFormatter.format(user.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RoleSettings userId={user.id} currentRole={user.role} action={updateUserRoleAction} />
          </CardContent>
        </Card>

        <Card className="border-destructive/25 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Destructive actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DangerZoneSection userId={user.id} action={deleteUserAction} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
