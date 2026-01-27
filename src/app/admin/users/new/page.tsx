import Link from "next/link"
import { UserRole } from "@prisma/client"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createUserAction } from "@/server/admin/users"

const roleOptions = Object.values(UserRole)

export default function NewUserPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add new user"
        description="Create a customer or admin account for tailored access."
        breadcrumb={[
          { label: "Users", href: "/admin/users" },
          { label: "Add new user", href: "/admin/users/new" },
        ]}
        actionsAlignment="end"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">Cancel</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUserAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="user-name" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Full name
                </label>
                <Input id="user-name" name="name" placeholder="Jane Doe" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="user-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Email address
                </label>
                <Input id="user-email" name="email" type="email" placeholder="jane@example.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="user-role" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Role
              </label>
              <select
                id="user-role"
                name="role"
                defaultValue={UserRole.CUSTOMER}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role} className="capitalize">
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Choose ADMIN for teammates who need dashboard access.</p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button asChild variant="ghost">
                <Link href="/admin/users">Discard</Link>
              </Button>
              <Button type="submit" className="bg-[#4a2b28] text-[#f2dcb8] hover:bg-[#3d221f]">
                Create user
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
