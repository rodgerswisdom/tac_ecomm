import type { ProductGalleryImage } from "@/types/product"

export function buildCartLineKey(productId: string, productImageId?: string | null) {
  return productImageId ? `${productId}:${productImageId}` : productId
}

function extractVariantName(alt: string): string | null {
  const trimmed = alt.trim()
  if (!trimmed) return null

  const withoutSuffix = trimmed
    .replace(/\s*[-–—]?\s*(image|img|photo)\s*#?\d+\s*$/i, "")
    .trim()
  const withoutPrefix = withoutSuffix
    .replace(/^(image|img|photo)\s*#?\d+\s*[-–—:]\s*/i, "")
    .trim()

  const candidate = withoutPrefix || withoutSuffix
  if (!candidate || /^(image|img|photo)\s*#?\d+$/i.test(candidate)) {
    return null
  }

  // Long multi-word strings are usually auto-generated product titles, not variant names.
  if (candidate.length > 28 || candidate.split(/\s+/).length > 4) {
    return null
  }

  return candidate
}

export function formatProductImageLabel(
  image: ProductGalleryImage,
  index: number,
): string {
  const variant = image.alt ? extractVariantName(image.alt) : null
  if (variant) return variant
  return `Design ${index + 1}`
}

/** Prefer design description; otherwise use product-level fallback copy. */
export function resolveDesignDescription(
  image: Pick<ProductGalleryImage, "description"> | null | undefined,
  productFallback: string,
): string {
  const design = image?.description?.trim()
  if (design) return design
  return productFallback
}

export function getDefaultGalleryImage(images: ProductGalleryImage[]): ProductGalleryImage {
  return images[0] ?? { id: "", url: "", order: 0 }
}

type OrderItemImageSource = {
  selectedImageUrl?: string | null
  productImage?: { url: string } | null
  product?: { images?: Array<{ url: string } | string> } | null
}

function resolveProductFallbackImage(
  images?: Array<{ url: string } | string>,
): string | null {
  const first = images?.[0]
  if (!first) return null
  return typeof first === "string" ? first : first.url
}

export function getOrderItemImageUrl(item: OrderItemImageSource): string | null {
  return (
    item.selectedImageUrl ??
    item.productImage?.url ??
    resolveProductFallbackImage(item.product?.images) ??
    null
  )
}

export function getOrderItemImageLabel(item: {
  selectedImageLabel?: string | null
}): string | null {
  const label = item.selectedImageLabel?.trim()
  return label || null
}
