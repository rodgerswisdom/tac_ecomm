"use client"

import { useState } from "react"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { ImageUploader } from "@/components/ImageUploader"
import { Button } from "@/components/ui/button"
import type { ActionResult } from "@/lib/admin/action-result"

type AddProductImageAction = (formData: FormData) => Promise<void | ActionResult>

export function AddProductImageForm({
  productId,
  addProductImageAction,
}: {
  productId: string
  addProductImageAction: AddProductImageAction
}) {
  const [imageUrl, setImageUrl] = useState("")
  const [formKey, setFormKey] = useState(0)

  return (
    <AdminActionForm
      key={formKey}
      action={addProductImageAction}
      successMessage="Image added."
      onSuccess={() => {
        setImageUrl("")
        setFormKey((key) => key + 1)
      }}
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
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Design label (optional)</span>
        <input
          name="alt"
          type="text"
          placeholder="e.g. Indigo weave"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Design description (optional)</span>
        <textarea
          name="description"
          rows={2}
          placeholder="Shown when this design is selected. Falls back to the product default if empty."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" size="sm" className="w-full" disabled={!imageUrl}>
        Add image
      </Button>
    </AdminActionForm>
  )
}
