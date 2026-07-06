"use client"

import { ImageUploader } from "@/components/ImageUploader"

type EditCategoryImageFieldProps = {
  defaultImage?: string | null
}

export function EditCategoryImageField({ defaultImage }: EditCategoryImageFieldProps) {
  return (
    <ImageUploader
      mode="single"
      name="image"
      defaultValue={defaultImage ?? ""}
      folder="categories"
      tags={["categories", "admin"]}
      helperText="PNG, JPG, WEBP, GIF or SVG (max 5MB)"
    />
  )
}
