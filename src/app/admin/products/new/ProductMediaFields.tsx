"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { ImageUploader } from "@/components/ImageUploader"
import type { UploadResult } from "@/lib/cloudinary"

interface ProductMediaFieldsProps {
  maxFiles?: number
  error?: string
  onMediaStateChange?: (hasMedia: boolean) => void
}

type MediaPayload = {
  url: string
  publicId: string
  bytes: number
  format: string
  width: number
  height: number
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ProductMediaFields({ maxFiles = 5, error, onMediaStateChange }: ProductMediaFieldsProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaPayload[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesChange = useCallback(
    (_: File[], __: string[], assets?: UploadResult[]) => {
      if (!assets || assets.length === 0) {
        setMediaAssets([])
        setLocalError("Add at least one product image.")
        return
      }

      const sanitized = assets
        .filter((asset): asset is UploadResult => Boolean(asset?.secure_url && asset.public_id))
        .map((asset) => ({
          url: asset.secure_url,
          publicId: asset.public_id,
          bytes: asset.bytes,
          format: asset.format,
          width: asset.width,
          height: asset.height,
        }))

      setMediaAssets(sanitized)
      setLocalError(null)
    },
    []
  )

  const handleUploadStateChange = useCallback((state: { uploading: boolean; error?: string }) => {
    setIsUploading(state.uploading)
    if (state.error) {
      setLocalError(state.error)
    }
  }, [])

  const mediaPayloadValue = JSON.stringify(mediaAssets)
  const feedbackMessage = localError ?? error ?? null
  const mediaCount = mediaAssets.length

  useEffect(() => {
    onMediaStateChange?.(isUploading || mediaCount > 0)
  }, [isUploading, mediaCount, onMediaStateChange])

  return (
    <div className="space-y-4">
      <ImageUploader
        mode="multiple"
        onChange={handleFilesChange}
        onUploadStateChange={handleUploadStateChange}
        maxFiles={maxFiles}
        folder="product-gallery"
        tags={["products", "admin"]}
      />
      <input type="hidden" name="mediaPayload" value={mediaPayloadValue} />
      {feedbackMessage ? <p className="text-xs text-rose-600">{feedbackMessage}</p> : null}

      {mediaCount > 0 ? (
        <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span>Gallery</span>
            <span>
              {mediaCount} / {maxFiles}
            </span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {mediaAssets.map((media, index) => (
              <li key={media.publicId} className="flex items-center gap-3 rounded-md border border-border/70 bg-white px-2 py-2">
                <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border/60 bg-muted">
                  <Image src={media.url} alt={`Product image ${index + 1}`} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{index === 0 ? "Cover image" : `Shot ${index + 1}`}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {media.width}×{media.height} · {formatFileSize(media.bytes)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
