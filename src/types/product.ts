export interface ProductGalleryImage {
  id: string
  url: string
  alt?: string
  description?: string | null
  order: number
}

export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  gallery: string[]
  galleryImages: ProductGalleryImage[]
  description: string
  fullDescription?: string
  origin: string
  materials: string[]
  category?: string
  productType?: string
  isCorporateGift?: boolean
  isBespoke?: boolean
  communityImpact?: string
  sourcingStory?: string
  artisan: {
    name: string
    region: string
    regionLabel: string
    quote: string
    portrait: string
  }
  brand?: string
  rating?: number
  reviewCount?: number
  isBestSeller?: boolean
  stock?: number
  isOutOfStock?: boolean
  colors?: string[]
  sizes?: string[]
  color?: string | null
  size?: string | null
  weight?: number | null
  dimensions?: string | null
  createdAt?: string
}
