import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddProductImageForm } from "./AddProductImageForm"
import { getProductDetail, getProductDeleteInfo } from "@/server/admin/products"
import { ImageSortableGallery } from "./ImageSortableGallery"
import { ProductDeleteForm } from "./ProductDeleteForm"
import {
  addProductImageAction,
  deleteProductImageAction,
  reorderImagesAction,
  updateProductAction,
  updateProductImageAction,
} from "@/server/admin/product-actions"
import { getCategoryOptions } from "@/server/admin/categories"

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>
}

const fieldLabel = "text-xs font-medium text-muted-foreground"

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params

  const [product, categories, deleteInfo] = await Promise.all([
    getProductDetail(productId),
    getCategoryOptions(),
    getProductDeleteInfo(productId),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Products / {product.name}
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{product.name}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">Back</Link>
          </Button>
          <ProductDeleteForm
            productId={product.id}
            productName={product.name}
            orderCount={deleteInfo.orderCount}
            orderNumbers={deleteInfo.orderNumbers}
          />
        </div>
      </div>

      {deleteInfo.orderCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Linked to {deleteInfo.orderCount} order{deleteInfo.orderCount === 1 ? "" : "s"} — consider archiving instead of deleting.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Product details</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminActionForm action={updateProductAction} successMessage="Product saved." className="space-y-3">
              <input type="hidden" name="id" value={product.id} />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 sm:col-span-2">
                  <span className={fieldLabel}>Name</span>
                  <Input name="name" defaultValue={product.name} required />
                </label>
                <label className="space-y-1">
                  <span className={fieldLabel}>SKU</span>
                  <Input name="sku" defaultValue={product.sku} required />
                </label>
                <label className="space-y-1">
                  <span className={fieldLabel}>Category</span>
                  <select
                    name="categoryId"
                    defaultValue={product.categoryId}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className={fieldLabel}>Default description</span>
                <textarea
                  name="description"
                  defaultValue={product.description}
                  minLength={10}
                  required
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  Used on the product page when a design has no description of its own. Also used for SEO.
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className={fieldLabel}>Selling price</span>
                  <Input name="price" type="number" step="0.01" defaultValue={product.price} required />
                </label>
                <label className="space-y-1">
                  <span className={fieldLabel}>Market price</span>
                  <Input
                    name="comparePrice"
                    type="number"
                    step="0.01"
                    defaultValue={product.comparePrice ?? ""}
                    placeholder="Optional"
                  />
                </label>
                <label className="space-y-1">
                  <span className={fieldLabel}>Stock</span>
                  <Input name="stock" type="number" min="0" defaultValue={product.stock} required />
                </label>
                <label className="space-y-1">
                  <span className={fieldLabel}>Weight (kg)</span>
                  <Input
                    name="weight"
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    defaultValue={product.weight ?? ""}
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className={fieldLabel}>Dimensions</span>
                  <Input
                    name="dimensions"
                    placeholder="Length × Width × Height"
                    defaultValue={product.dimensions ?? ""}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="hidden" name="isBespoke" value="false" />
                  <input
                    type="checkbox"
                    name="isBespoke"
                    value="true"
                    defaultChecked={product.isBespoke}
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <span>
                    <span className="block text-sm font-medium">Bespoke & Limited Edition</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      When enabled, this product appears only on the Bespoke & Limited Edition shop and is hidden from regular Collections.
                    </span>
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Save changes
              </Button>
            </AdminActionForm>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageSortableGallery
              productId={product.id}
              initialImages={product.images}
              onDeleteAction={deleteProductImageAction}
              onUpdateAction={updateProductImageAction}
              onReorderAction={reorderImagesAction}
              compact
            />
            <AddProductImageForm productId={product.id} addProductImageAction={addProductImageAction} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
