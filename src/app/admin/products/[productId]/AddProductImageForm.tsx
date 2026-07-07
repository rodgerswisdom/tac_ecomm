"use client"

import { useState } from "react"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { ImageUploader } from "@/components/ImageUploader"
import { Input } from "@/components/ui/input"
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
      className="space-y-2 rounded-lg border border-dashed border-border p-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Image</p>
        <ImageUploader
          mode="single"
          name="url"
          folder="product-gallery"
          tags={["products", "admin"]}
          helperText="Click to upload from your computer or drag and drop."
          onChange={(_files, urls) => setImageUrl(urls[0] ?? "")}
        />
      </div>
      <Input name="alt" placeholder="Alt text" />
      <Input name="order" type="number" min="0" placeholder="Display order" />
      <Button type="submit" size="sm" disabled={!imageUrl}>
        Add image
      </Button>
    </AdminActionForm>
  )
}
