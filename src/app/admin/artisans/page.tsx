import Link from "next/link"
import { Plus, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminPageHeader } from "@/components/admin/page-header"
import { RowActions } from "@/components/admin/row-actions"
import { getArtisans, deleteArtisanAction } from "@/server/admin/artisans"

export default async function ArtisansPage() {
  const artisans = await getArtisans()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Artisans"
        description="Manage the people and stories behind Tac Accessories."
        breadcrumb={[{ label: "Artisans", href: "/admin/artisans" }]}
        actions={
          <Button asChild size="sm" className="gap-2">
            <Link href="/admin/artisans/new">
              <Plus className="h-4 w-4" /> Add Artisan
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Artisans ({artisans.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Artisan</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Region</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Craft</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Products</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {artisans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No artisans found. Add one to get started.
                  </td>
                </tr>
              ) : (
                artisans.map((artisan) => (
                  <tr key={artisan.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-muted">
                          {artisan.portrait ? (
                            <img
                              src={artisan.portrait}
                              alt={artisan.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{artisan.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{artisan.bio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-foreground">{artisan.regionLabel}</p>
                      <p className="text-xs text-muted-foreground">{artisan.region}</p>
                    </td>
                    <td className="px-4 py-4">{artisan.craft}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {artisan._count.products} Products
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <RowActions
                        viewHref={`/admin/artisans/${artisan.id}`}
                        editHref={`/admin/artisans/${artisan.id}`}
                        deleteConfig={{
                          action: deleteArtisanAction,
                          fields: { id: artisan.id },
                          resourceLabel: artisan.name,
                          confirmTitle: "Delete Artisan?",
                          confirmDescription: `Are you sure you want to delete ${artisan.name}? This action cannot be undone.`,
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
