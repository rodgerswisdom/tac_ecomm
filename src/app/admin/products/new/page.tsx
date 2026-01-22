import Link from "next/link"
import { ProductType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProductAction } from "@/server/admin/products"
import { getCategoryOptions } from "@/server/admin/categories"
import { ProductMediaFields } from "./ProductMediaFields"

export default async function NewProductPage() {
  const categories = await getCategoryOptions()
  const createdAtDisplay = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Products / Create</p>
          <h1 className="text-3xl font-semibold tracking-tight">Add new product</h1>
          <p className="text-sm text-muted-foreground">Create a new product and add it to your inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/admin/products">Back to products</Link>
          </Button>
        </div>
      </div>

      <form action={createProductAction} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product information</CardTitle>
                {/* <CardDescription>Capture the essentials buyers see first.</CardDescription> */}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                      Title
                    </label>
                    <Input id="name" name="name" placeholder="Enter a product title..." required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sku" className="text-sm font-medium text-muted-foreground">
                      SKU
                    </label>
                    <Input id="sku" name="sku" placeholder="eg., PRD-001" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter a product description..."
                    minLength={10}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium text-muted-foreground">
                      Base pricing
                    </label>
                    <Input id="price" name="price" type="number" step="0.01" placeholder="Enter base price..." required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="comparePrice" className="text-sm font-medium text-muted-foreground">
                      Price with discount
                    </label>
                    <Input id="comparePrice" name="comparePrice" type="number" step="0.01" placeholder="Enter promo price..." />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="stock" className="text-sm font-medium text-muted-foreground">
                      Stock
                    </label>
                    <Input id="stock" name="stock" type="number" min="0" placeholder="Enter stock quantity..." required />
                    {/* <p className="text-xs text-muted-foreground">
                      Availability updates automatically: stock above zero is &quot;In stock&quot;, zero shows &quot;Out of stock&quot; on the
                      storefront.
                    </p> */}
                  </div>
                  <div className="space-y-2 rounded-md border border-dashed border-input/60 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Inventory tip</p>
                    {/* <p>Most shops still publish out-of-stock items so customers can join wishlists or request restocks.</p> */}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="productType" className="text-sm font-medium text-muted-foreground">
                      Product type
                    </label>
                    <select
                      id="productType"
                      name="productType"
                      defaultValue={ProductType.READY_TO_WEAR}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                    >
                      {Object.values(ProductType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Promote as</label>
                    <div className="flex flex-wrap gap-4 text-sm">
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery</CardTitle>
                <CardDescription>Optional logistics data for bespoke quotes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium text-muted-foreground">
                      Weight (kg)
                    </label>
                    <Input id="weight" name="weight" type="number" step="0.01" placeholder="e.g. 2.5" />
                    <p className="text-xs text-muted-foreground">Used to generate accurate shipping estimates.</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dimensions" className="text-sm font-medium text-muted-foreground">
                      Dimensions
                    </label>
                    <Input id="dimensions" name="dimensions" placeholder="e.g. 25 x 15 x 10 cm" />
                    <p className="text-xs text-muted-foreground">Enter length × width × height with units.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product image</CardTitle>
                <CardDescription>Upload a hero image or drop multiple assets for the gallery.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductMediaFields />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Choose whether to publish now or keep working in draft.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" name="intent" value="publish" className="w-full">
                  Save &amp; publish
                </Button>
                <Button type="submit" name="intent" value="draft" variant="outline" className="w-full">
                  Save as draft
                </Button>
                <Button asChild variant="ghost" className="w-full text-muted-foreground">
                  <Link href="/admin/products">Cancel</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product status</CardTitle>
                <CardDescription>Control what buyers can see before publishing.</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium">Draft</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Visibility</dt>
                    <dd className="font-medium">Private</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{createdAtDisplay}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
