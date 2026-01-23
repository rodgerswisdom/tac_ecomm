import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createCategoryAction,
  deleteCategoryAction,
  getCategories,
  updateCategoryAction,
} from "@/server/admin/categories"
import { AdminPageHeader } from "@/components/admin/page-header"

interface CategoriesPageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = (await searchParams) ?? {}
  const categories = await getCategories()
  const selectedId = parseParam(params?.categoryId)
  const selectedCategory = categories.find((category) => category.id === selectedId)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Organize collections and hierarchies."
        breadcrumb={[
          { label: "Categories", href: "/admin/categories" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Category list</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Slug</th>
                <th className="pb-2 font-medium">Parent</th>
                <th className="pb-2 font-medium">Products</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {categories.map((category) => (
                <tr key={category.id} className="align-middle">
                  <td className="py-3 font-medium">{category.name}</td>
                  <td className="py-3 text-muted-foreground">{category.slug}</td>
                  <td className="py-3">{category.parent?.name ?? '—'}</td>
                  <td className="py-3">{category._count.products}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/categories?categoryId=${category.id}`}>Edit</Link>
                      </Button>
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <Button variant="ghost" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create category</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategoryAction} className="space-y-3">
              <Input name="name" placeholder="Name" required />
              <Textarea name="description" placeholder="Description" />
              <Input name="image" placeholder="Image URL" />
              <select name="parentId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">No parent</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit category</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <form action={updateCategoryAction} className="space-y-3">
                <input type="hidden" name="id" value={selectedCategory.id} />
                <Input name="name" defaultValue={selectedCategory.name} required />
                <Textarea name="description" defaultValue={selectedCategory.description ?? ''} />
                <Input name="image" defaultValue={selectedCategory.image ?? ''} />
                <select
                  name="parentId"
                  defaultValue={selectedCategory.parentId ?? ''}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No parent</option>
                  {categories
                    .filter((category) => category.id !== selectedCategory.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                <Button type="submit">Save changes</Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a category to edit.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
