import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getCategoryById, getCategoryOptions, updateCategoryAction, deleteCategoryAction } from "@/server/admin/categories"

export default async function EditCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params
  const category = await getCategoryById(categoryId)
  if (!category) {
    notFound()
  }

  const options = await getCategoryOptions()
  const parentOptions = options.filter((option) => option.id !== category.id)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Edit ${category.name}`}
        description="Update category metadata for navigation and merchandising."
        breadcrumb={[
          { label: "Categories", href: "/admin/categories" },
          { label: category.name, href: `/admin/categories/${category.id}` },
        ]}
        toolbar={
          <Button asChild variant="ghost" size="sm" className="border border-border">
            <Link href="/admin/categories">Back to categories</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              await updateCategoryAction(undefined, formData)
            }}
            className="space-y-6"
          >
            <input type="hidden" name="id" value={category.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="name">Title</label>
                <Input id="name" name="name" defaultValue={category.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="slug">Slug</label>
                <Input id="slug" name="slug" defaultValue={category.slug ?? ""} placeholder="auto-generated if left blank" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="description">Description</label>
              <Textarea
                id="description"
                name="description"
                defaultValue={category.description ?? ""}
                rows={4}
                placeholder="Optional description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="image">Image URL</label>
                <Input id="image" name="image" defaultValue={category.image ?? ""} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="parentId">Parent category</label>
                <select
                  id="parentId"
                  name="parentId"
                  defaultValue={category.parent?.id ?? ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {parentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button asChild variant="ghost">
                <Link href="/admin/categories">Cancel</Link>
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Deleting this category requires no products or child categories to be attached.</p>
          <form action={deleteCategoryAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="categoryId" value={category.id} />
            <Button type="submit" variant="destructive" size="sm">
              Delete category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
