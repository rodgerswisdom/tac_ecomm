"use client"

import { useState } from "react"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { ImageUploader } from "@/components/ImageUploader"
import { Button } from "@/components/ui/button"

type AddProductImageAction = (formData: FormData) => Promise<void>

export function AddProductImageForm({
  productId,
  addProductImageAction,
}: {
  productId: string
  addProductImageAction: AddProductImageAction
}) {
  const [imageUrl, setImageUrl] = useState("")

  return (
    <AdminActionForm
      action={addProductImageAction}
      successMessage="Image added."
      className="space-y-3 rounded-lg border border-dashed border-border p-3"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="order" value="0" />
      <ImageUploader
        mode="single"
        name="url"
        folder="product-gallery"
        tags={["products", "admin"]}
        helperText="Upload or drag and drop"
        onChange={(_files, urls) => setImageUrl(urls[0] ?? "")}
      />
      <Button type="submit" size="sm" className="w-full" disabled={!imageUrl}>
        Add image
      </Button>
    </AdminActionForm>
  )
}
