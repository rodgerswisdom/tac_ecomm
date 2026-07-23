"use client"

import { useState } from "react"
import { Images } from "lucide-react"

import { ImageUploader } from "@/components/ImageUploader"
import { Button } from "@/components/ui/button"
import { ProductImagePickerDialog } from "@/components/admin/ProductImagePickerDialog"

type CategoryImageFieldProps = {
  defaultImage?: string | null
  helperText?: string
}

export function CategoryImageField({
  defaultImage,
  helperText = "PNG, JPG, WEBP, GIF or SVG (max 5MB)",
}: CategoryImageFieldProps) {
  const [imageUrl, setImageUrl] = useState(defaultImage ?? "")
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-4">
      <ImageUploader
        mode="single"
        name="image"
        defaultValue={defaultImage ?? ""}
        value={imageUrl}
        onValueChange={setImageUrl}
        folder="categories"
        tags={["categories", "admin"]}
        helperText={helperText}
      />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-teal/15" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-brand-teal/15" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 rounded-2xl"
        onClick={() => setPickerOpen(true)}
      >
        <Images className="h-4 w-4" />
        Choose from existing product images
      </Button>

      <ProductImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={setImageUrl}
      />
    </div>
  )
}
