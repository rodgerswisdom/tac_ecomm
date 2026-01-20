import Link from "next/link"
import { ProductType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createProductAction } from "@/server/admin/products"
import { getCategoryOptions } from "@/server/admin/categories"

export default async function NewProductPage() {
  const categories = await getCategoryOptions()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Products / Create</p>
          <h1 className="text-3xl font-semibold tracking-tight">Add a product</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to publish a new catalog item.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProductAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="name" placeholder="Product name" required />
              <Input name="sku" placeholder="SKU" required />
            </div>
            <textarea
              name="description"
              placeholder="Describe this product"
              minLength={10}
              required
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="price" type="number" step="0.01" placeholder="Price" required />
              <Input name="comparePrice" type="number" step="0.01" placeholder="Compare at" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="stock" type="number" min="0" placeholder="Inventory" required />
              <select
                name="categoryId"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              name="productType"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={ProductType.READY_TO_WEAR}
            >
              {Object.values(ProductType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isActive" value="true" defaultChecked /> Active
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isFeatured" value="true" /> Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isBespoke" value="true" /> Bespoke
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isCorporateGift" value="true" /> Corporate gift
              </label>
            </div>
            <Button type="submit" className="w-full md:w-fit">
              Create product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
