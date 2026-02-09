import { Prisma, ProductType } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { ProductCardData } from "@/types/product"

const FALLBACK_IMAGE = "/textures/linen.png"
const FALLBACK_ARTISAN = {
  name: "Tac Accessories Collective",
  region: "pan-african",
  regionLabel: "Pan-African Studio",
  quote: "Crafted within the Tac Accessories atelier.",
  portrait: "/patterns/adinkra-glyph.svg",
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true
    artisan: true
    category: true
    reviews: { select: { rating: true } }
  }
}>

export type ProductCardQueryOptions = {
  limit?: number
  skip?: number
  categorySlug?: string
  ids?: string[]
  search?: string
  featuredOnly?: boolean
  includeDrafts?: boolean
  productType?: ProductType
  corporateGiftsOnly?: boolean
}

export async function getProductCardData(options: ProductCardQueryOptions = {}): Promise<ProductCardData[]> {
  const where: Prisma.ProductWhereInput = {
    isDraft: options.includeDrafts ? undefined : false,
    isActive: options.includeDrafts ? undefined : true,
  }

  if (options.categorySlug) {
    where.category = { slug: options.categorySlug }
  }

  if (options.ids?.length) {
    where.id = { in: options.ids }
  }

  if (options.featuredOnly) {
    where.isFeatured = true
  }

  if (options.corporateGiftsOnly) {
    where.isCorporateGift = true
  }

  if (options.productType) {
    where.productType = options.productType
  }

  if (options.search?.trim()) {
    const term = options.search.trim()
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { shortDescription: { contains: term, mode: "insensitive" } },
      { materials: { has: term } },
      { origin: { contains: term, mode: "insensitive" } },
      { category: { name: { contains: term, mode: "insensitive" } } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
      artisan: true,
      category: true,
      reviews: { select: { rating: true } },
    },
    take: options.limit,
    skip: options.skip,
  })

  return products.map(mapProductToCard)
}

export async function getFeaturedProductCards(limit = 4) {
  return getProductCardData({ featuredOnly: true, limit })
}

export async function getCollectionProductCards(slug: string) {
  if (slug === "matching-sets") {
    return getProductCardData({ productType: ProductType.MATCHING_SET })
  }

  if (slug === "corporate-gifts") {
    return getProductCardData({ corporateGiftsOnly: true })
  }

  return getProductCardData({ categorySlug: slug })
}

export async function getProductCardBySlug(slug: string) {
  if (!slug) return null

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      artisan: true,
      category: true,
      reviews: { select: { rating: true } },
    },
  })

  return product ? mapProductToCard(product) : null
}

type RelatedProductOptions = {
  productId: string
  categorySlug?: string | null
  limit?: number
}

export async function getRelatedProductCards({
  productId,
  categorySlug,
  limit = 6,
}: RelatedProductOptions) {
  const baseWhere: Prisma.ProductWhereInput = {
    id: { not: productId },
    isDraft: false,
    isActive: true,
  }

  if (categorySlug) {
    baseWhere.category = { slug: categorySlug }
  }

  const related = await prisma.product.findMany({
    where: baseWhere,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
      artisan: true,
      category: true,
      reviews: { select: { rating: true } },
    },
  })

  if (related.length >= limit) {
    return related.map(mapProductToCard)
  }

  const usedIds = new Set<string>([productId, ...related.map((item) => item.id)])

  const filler = await prisma.product.findMany({
    where: {
      id: { notIn: Array.from(usedIds) },
      isDraft: false,
      isActive: true,
    },
    take: limit - related.length,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
      artisan: true,
      category: true,
      reviews: { select: { rating: true } },
    },
  })

  return [...related, ...filler].map(mapProductToCard)
}

function mapProductToCard(product: ProductWithRelations): ProductCardData {
  const sortedImages = [...product.images].sort((a, b) => a.order - b.order)
  const gallery = sortedImages.map((image) => image.url)
  const image = gallery[0] ?? FALLBACK_IMAGE
  const reviewCount = product.reviews.length
  const ratingAverage = reviewCount
    ? Number((product.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount).toFixed(1))
    : undefined

  const artisan = product.artisan
    ? {
        name: product.artisan.name,
        region: product.artisan.region,
        regionLabel: product.artisan.regionLabel,
        quote: product.artisan.quote,
        portrait: product.artisan.portrait,
      }
    : {
        ...FALLBACK_ARTISAN,
        region: product.origin?.toLowerCase() ?? FALLBACK_ARTISAN.region,
        regionLabel: product.origin ?? FALLBACK_ARTISAN.regionLabel,
      }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.comparePrice ?? undefined,
    image,
    gallery: gallery.length > 0 ? gallery : [FALLBACK_IMAGE],
    description: product.shortDescription ?? product.description,
    origin: product.origin ?? artisan.regionLabel,
    materials: product.materials ?? [],
    category: product.category?.slug,
    subcategory: product.subcategory ?? undefined,
    productType: product.productType,
    isCorporateGift: product.isCorporateGift,
    communityImpact: product.communityImpact ?? undefined,
    sourcingStory: product.sourcingStory ?? undefined,
    artisan,
    brand: product.category?.name,
    rating: ratingAverage,
    reviewCount: reviewCount || undefined,
    isBestSeller: product.isFeatured,
    colors: undefined,
    sizes: undefined,
    createdAt: product.createdAt.toISOString(),
  }
}
