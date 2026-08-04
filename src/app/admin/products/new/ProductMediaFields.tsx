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
  description?: string
  alt?: string
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

      setMediaAssets((prev) => {
        const byPublicId = new Map(prev.map((item) => [item.publicId, item]))
        return assets
          .filter((asset): asset is UploadResult => Boolean(asset?.secure_url && asset.public_id))
          .map((asset) => {
            const existing = byPublicId.get(asset.public_id)
            return {
              url: asset.secure_url,
              publicId: asset.public_id,
              bytes: asset.bytes,
              format: asset.format,
              width: asset.width,
              height: asset.height,
              description: existing?.description ?? "",
              alt: existing?.alt ?? "",
            }
          })
      })
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

  const updateAssetField = useCallback((publicId: string, field: "description" | "alt", value: string) => {
    setMediaAssets((prev) =>
      prev.map((item) => (item.publicId === publicId ? { ...item, [field]: value } : item)),
    )
  }, [])

  const mediaPayloadValue = JSON.stringify(
    mediaAssets.map((asset) => ({
      ...asset,
      description: asset.description?.trim() || null,
      alt: asset.alt?.trim() || null,
    })),
  )
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
            <span>Gallery / designs</span>
            <span>
              {mediaCount} / {maxFiles}
            </span>
          </div>
          <ul className="space-y-3 text-xs text-muted-foreground">
            {mediaAssets.map((media, index) => (
              <li key={media.publicId} className="rounded-md border border-border/70 bg-white px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted">
                    <Image src={media.url} alt={`Product image ${index + 1}`} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {index === 0 ? "Cover / Design 1" : `Design ${index + 1}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {media.width}×{media.height} · {formatFileSize(media.bytes)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Label (optional)</span>
                    <input
                      type="text"
                      value={media.alt ?? ""}
                      onChange={(event) => updateAssetField(media.publicId, "alt", event.target.value)}
                      placeholder={`Design ${index + 1}`}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Description (optional)</span>
                    <textarea
                      value={media.description ?? ""}
                      onChange={(event) => updateAssetField(media.publicId, "description", event.target.value)}
                      rows={2}
                      placeholder="Falls back to the product description when empty."
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
