export interface CollectionHighlight {
  title: string
  description: string
}

export interface CollectionSpotlight {
  quote: string
  name: string
  role: string
  image: string
}

export interface CollectionCta {
  label: string
  href: string
  variant?: "primary" | "secondary"
}

export interface CollectionSummary {
  id: string
  name: string
  slug: string
  description: string
  image: string
  itemCount: number
  featuredRegions: string[]
  artisanCount: number
  subcategories: string[]
  heroTitle?: string
  heroDescription?: string
  heroImage?: string
  longDescription?: string
  highlights?: CollectionHighlight[]
  spotlight?: CollectionSpotlight
  ctas?: CollectionCta[]
  featuredProductIds?: string[]
}
