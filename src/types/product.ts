export interface ProductGalleryImage {
  id: string
  url: string
  alt?: string
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
  origin: string
  materials: string[]
  category?: string
  productType?: string
  isCorporateGift?: boolean
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
  createdAt?: string
}
