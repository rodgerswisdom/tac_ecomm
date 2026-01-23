import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { getUsersSummary, updateUserRoleAction } from "@/server/admin/users"
import { AdminPageHeader } from "@/components/admin/page-header"

const roleOptions = Object.values(UserRole)

export default async function UsersPage() {
  const users = await getUsersSummary()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users"
        description="Review customer behavior and roles."
        breadcrumb={[
          { label: "Users", href: "/admin/users" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>User directory</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Orders</th>
                <th className="pb-2 font-medium">Total spent</th>
                <th className="pb-2 font-medium">Created</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {users.map((user) => (
                <tr key={user.id} className="align-middle">
                  <td className="py-3 font-medium">{user.name ?? 'Customer'}</td>
                  <td className="py-3 text-muted-foreground">{user.email}</td>
                  <td className="py-3 capitalize">{user.role.toLowerCase()}</td>
                  <td className="py-3">{user._count.orders}</td>
                  <td className="py-3 font-semibold">{formatPrice(user.totalSpent)}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    <form action={updateUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.replace(/_/g, ' ').toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Update
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
