"use client"

import { useCallback, useState } from "react"
import { PhotoUpload } from "@/components/PhotoUpload"

interface ProductMediaFieldsProps {
  maxFiles?: number
}

const sanitizeUrls = (urls: string[]) =>
  urls.filter((url): url is string => typeof url === "string" && url.trim().length > 0)

export function ProductMediaFields({ maxFiles = 5 }: ProductMediaFieldsProps) {
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])

  const handleFilesChange = useCallback((_: File[], urls: string[]) => {
    setGalleryUrls(sanitizeUrls(urls))
  }, [])

  const primaryImage = galleryUrls[0] ?? ""

  return (
    <div className="space-y-4">
      <PhotoUpload onFilesChange={handleFilesChange} maxFiles={maxFiles} />
      <input type="hidden" name="primaryImageUrl" value={primaryImage} />
      <input type="hidden" name="galleryImageUrls" value={JSON.stringify(galleryUrls)} />
      <p className="text-xs text-muted-foreground">
        {galleryUrls.length > 0
          ? `We will save ${galleryUrls.length} image${galleryUrls.length === 1 ? "" : "s"} with this product.`
          : `Upload up to ${maxFiles} product images. The first image becomes the primary thumbnail.`}
      </p>
    </div>
  )
}
