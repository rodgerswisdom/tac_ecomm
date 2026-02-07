import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ProductType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddProductImageForm } from "./AddProductImageForm"
import {
  addProductImageAction,
  addVariantAction,
  deleteProductAction,
  deleteProductImageAction,
  deleteVariantAction,
  getProductDetail,
  updateProductAction,
} from "@/server/admin/products"
import { getCategoryOptions } from "@/server/admin/categories"

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const [{ productId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<Record<string, string | string[]>>({}),
  ])

  const statusParam = (() => {
    const raw = query?.status
    if (!raw) return undefined
    return Array.isArray(raw) ? raw[0] : raw
  })()

  const statusMessage =
    statusParam === "published"
      ? "Product published successfully and is now live."
      : statusParam === "draft"
        ? "Draft saved successfully."
        : null

  const [product, categories] = await Promise.all([
    getProductDetail(productId),
    getCategoryOptions(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Products / {product.name}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            Update availability, pricing, variants, and imagery for this product.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">Back to products</Link>
          </Button>
          <form action={deleteProductAction}>
            <input type="hidden" name="productId" value={product.id} />
            <Button variant="destructive" size="sm">
              Delete product
            </Button>
          </form>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProductAction} className="space-y-4">
              <input type="hidden" name="id" value={product.id} />
              <Input name="name" defaultValue={product.name} required />
              <Input name="sku" defaultValue={product.sku} required />
              <textarea
                name="description"
                defaultValue={product.description}
                minLength={10}
                required
                className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="price" type="number" step="0.01" defaultValue={product.price} required />
                <Input
                  name="comparePrice"
                  type="number"
                  step="0.01"
                  defaultValue={product.comparePrice ?? ""}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="stock" type="number" min="0" defaultValue={product.stock} required />
                <select
                  name="categoryId"
                  defaultValue={product.categoryId}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Weight (kg)</span>
                  <Input
                    name="weight"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2.5"
                    defaultValue={product.weight ?? ""}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Dimensions</span>
                  <Input
                    name="dimensions"
                    placeholder="Length × Width × Height"
                    defaultValue={product.dimensions ?? ""}
                  />
                </label>
              </div>
              <select
                name="productType"
                defaultValue={product.productType}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.values(ProductType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isActive" value="true" defaultChecked={product.isActive} /> Active
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isFeatured" value="true" defaultChecked={product.isFeatured} /> Featured
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isBespoke" value="true" defaultChecked={product.isBespoke} /> Bespoke
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isCorporateGift"
                    value="true"
                    defaultChecked={product.isCorporateGift}
                  />
                  Corporate gift
                </label>
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.variants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No variants added.</p>
            ) : (
              product.variants.map((variant) => (
                <div key={variant.id} className="rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{variant.name}</div>
                      <p className="text-xs text-muted-foreground">{variant.value}</p>
                    </div>
                    <form action={deleteVariantAction}>
                      <input type="hidden" name="variantId" value={variant.id} />
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                  <div className="mt-2 grid grid-cols-3 text-xs text-muted-foreground">
                    <span>Stock: {variant.stock}</span>
                    <span>Price: {variant.price ?? "—"}</span>
                    <span>SKU: {variant.sku ?? "—"}</span>
                  </div>
                </div>
              ))
            )}
            <form action={addVariantAction} className="space-y-2 rounded-lg border border-dashed border-border p-4">
              <input type="hidden" name="productId" value={product.id} />
              <div className="grid grid-cols-2 gap-2">
                <Input name="name" placeholder="Variant name" required />
                <Input name="value" placeholder="Value" required />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input name="price" type="number" step="0.01" placeholder="Price" />
                <Input name="stock" type="number" placeholder="Stock" min="0" />
                <Input name="sku" placeholder="SKU" />
              </div>
              <Button type="submit" size="sm">
                Add variant
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {product.images.length === 0 && <p className="text-sm text-muted-foreground">No images uploaded.</p>}
            {product.images.map((image) => (
              <div key={image.id} className="w-48 rounded-lg border border-border p-2">
                <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
                  <Image src={image.url} alt={image.alt ?? product.name} fill sizes="192px" className="object-cover" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Order {image.order}</p>
                <form action={deleteProductImageAction} className="mt-2">
                  <input type="hidden" name="imageId" value={image.id} />
                  <Button type="submit" variant="ghost" size="sm" className="w-full">
                    Remove
                  </Button>
                </form>
              </div>
            ))}
          </div>
          <AddProductImageForm productId={product.id} addProductImageAction={addProductImageAction} />
        </CardContent>
      </Card>
    </div>
  )
}
