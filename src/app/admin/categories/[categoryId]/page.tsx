import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCategoryById, getCategoryOptions, deleteCategoryAction } from "@/server/admin/categories"
import { EditCategoryForm } from "./EditCategoryForm"

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
        toolbarAlignment="end"
      />

      <EditCategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parent: category.parent,
        }}
        parentOptions={parentOptions}
      />

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
