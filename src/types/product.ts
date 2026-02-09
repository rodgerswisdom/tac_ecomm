export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  gallery: string[]
  description: string
  origin: string
  materials: string[]
  category?: string
  subcategory?: string
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
  colors?: string[]
  sizes?: string[]
  createdAt?: string
}
