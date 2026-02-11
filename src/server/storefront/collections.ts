import { ProductType } from "@prisma/client"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getProductCardData, type ProductCardQueryOptions } from "@/server/storefront/products"
import type { CollectionSummary, CollectionHighlight, CollectionSpotlight, CollectionCta } from "@/types/collection"
import type { ProductCardData } from "@/types/product"

const FALLBACK_COLLECTION_IMAGE = "/patterns/linen.png"

type CategoryWithActiveProducts = Prisma.CategoryGetPayload<{
  include: {
    products: {
      where: {
        isActive: true
        isDraft: false
      }
      include: {
        images: {
          orderBy: { order: "asc" }
        }
        artisan: true
      }
    }
  }
}>

type CollectionSummaryOptions = {
  excludeSlugs?: string[]
  limit?: number
  includeVirtual?: boolean
}

export async function getCollectionSummaries(options: CollectionSummaryOptions = {}) {
  const { excludeSlugs = [], limit, includeVirtual = true } = options

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { isActive: true, isDraft: false },
        include: {
          images: { orderBy: { order: "asc" } },
          artisan: true,
        },
      },
    },
  })

  let summaries: CollectionSummary[] = categories.map(mapCategoryToSummary)

  if (includeVirtual) {
    const virtualCollections = await Promise.all([
      buildVirtualCollectionSummary({
        slug: "matching-sets",
        name: "Matching Sets",
        description: "Curated ensembles crafted as cohesive heirloom sets.",
        query: { productType: ProductType.MATCHING_SET },
      }),
      buildVirtualCollectionSummary({
        slug: "corporate-gifts",
        name: "Corporate Gifts",
        description: "Purposeful gifting programs for partners and teams.",
        query: { corporateGiftsOnly: true },
      }),
    ])

    summaries = summaries.concat(
      virtualCollections.filter((collection): collection is CollectionSummary => Boolean(collection))
    )
  }

  summaries = summaries.filter((collection) => !excludeSlugs.includes(collection.slug))

  if (limit) {
    summaries = summaries.slice(0, limit)
  }

  return summaries
}

export async function getCollectionSummaryBySlug(slug: string) {
  if (!slug) return null

  if (slug === "matching-sets") {
    return buildVirtualCollectionSummary({
      slug,
      name: "Matching Sets",
      description: "Coordinated heirloom ensembles crafted by the TAC atelier.",
      query: { productType: ProductType.MATCHING_SET },
    })
  }

  if (slug === "corporate-gifts") {
    return buildVirtualCollectionSummary({
      slug,
      name: "Corporate Gifts",
      description: "Professional gifting programs that center artisan impact.",
      query: { corporateGiftsOnly: true },
    })
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true, isDraft: false },
        include: {
          images: { orderBy: { order: "asc" } },
          artisan: true,
        },
      },
    },
  })

  if (!category) return null

  return mapCategoryToSummary(category)
}

export async function getCollectionSlugs() {
  const categories = await prisma.category.findMany({ select: { slug: true } })
  return categories
    .map((category) => category.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
}

function mapCategoryToSummary(category: CategoryWithActiveProducts): CollectionSummary {
  const sortedProducts = category.products
  const heroImage = category.image ?? sortedProducts[0]?.images[0]?.url ?? FALLBACK_COLLECTION_IMAGE
  const description = category.description ?? "Curated by the TAC atelier"
  const featuredRegions = uniqueStrings(
    sortedProducts
      .map((product) => product.origin || product.artisan?.regionLabel)
      .filter(Boolean) as string[]
  )
  const artisanCount = new Set(sortedProducts.map((product) => product.artisan?.id).filter(Boolean)).size
  const subcategories = uniqueStrings(
    sortedProducts.map((product) => product.subcategory).filter(Boolean) as string[]
  )

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description,
    image: heroImage,
    itemCount: sortedProducts.length,
    featuredRegions,
    artisanCount,
    subcategories,
    heroTitle: category.name,
    heroDescription: description,
    heroImage,
    longDescription: description,
    highlights: buildHighlights(sortedProducts.length, artisanCount, featuredRegions),
    spotlight: buildSpotlightFromCategoryProducts(sortedProducts),
    ctas: buildDefaultCtas(category.name),
    featuredProductIds: sortedProducts.slice(0, 3).map((product) => product.id),
  }
}

async function buildVirtualCollectionSummary({
  slug,
  name,
  description,
  query,
}: {
  slug: string
  name: string
  description: string
  query: ProductCardQueryOptions
}): Promise<CollectionSummary | null> {
  const products = await getProductCardData(query)

  if (!products.length) {
    return null
  }

  return mapProductCardsToSummary({
    slug,
    name,
    description,
    products,
  })
}

function mapProductCardsToSummary({
  slug,
  name,
  description,
  products,
}: {
  slug: string
  name: string
  description: string
  products: ProductCardData[]
}): CollectionSummary {
  const heroImage = products[0]?.image ?? FALLBACK_COLLECTION_IMAGE
  const featuredRegions = uniqueStrings(products.map((product) => product.origin).filter(Boolean))
  const subcategories = uniqueStrings(
    products.map((product) => product.subcategory).filter(Boolean) as string[]
  )
  const artisanCount = new Set(products.map((product) => product.artisan?.name).filter(Boolean)).size

  return {
    id: slug,
    name,
    slug,
    description,
    image: heroImage,
    itemCount: products.length,
    featuredRegions,
    artisanCount,
    subcategories,
    heroTitle: name,
    heroDescription: description,
    heroImage,
    longDescription: description,
    highlights: buildHighlights(products.length, artisanCount, featuredRegions),
    spotlight: buildSpotlightFromProductCards(products),
    ctas: buildDefaultCtas(name),
    featuredProductIds: products.slice(0, 3).map((product) => product.id),
  }
}

function buildSpotlightFromCategoryProducts(products: CategoryWithActiveProducts["products"]): CollectionSpotlight | undefined {
  const productWithArtisan = products.find((product) => product.artisan)
  if (!productWithArtisan?.artisan) return undefined

  return {
    quote: productWithArtisan.artisan.quote,
    name: productWithArtisan.artisan.name,
    role: productWithArtisan.artisan.regionLabel,
    image: productWithArtisan.artisan.portrait,
  }
}

function buildSpotlightFromProductCards(products: ProductCardData[]): CollectionSpotlight | undefined {
  const productWithArtisan = products.find((product) => product.artisan)
  if (!productWithArtisan?.artisan) return undefined

  return {
    quote: productWithArtisan.artisan.quote,
    name: productWithArtisan.artisan.name,
    role: productWithArtisan.artisan.regionLabel,
    image: productWithArtisan.artisan.portrait,
  }
}

function buildHighlights(itemCount: number, artisanCount: number, featuredRegions: string[]): CollectionHighlight[] {
  return [
    {
      title: "Gallery Pieces",
      description: `${itemCount} active designs`,
    },
    {
      title: "Artisan Circle",
      description: `${artisanCount} collaborating makers`,
    },
    {
      title: "Featured Regions",
      description: featuredRegions.length ? featuredRegions.join(", ") : "Pan-African",
    },
  ]
}

function buildDefaultCtas(name: string): CollectionCta[] {
  return [
    { label: `Shop ${name}`, href: "#collection-products", variant: "primary" },
    { label: "Book Styling Session", href: "/contact", variant: "secondary" },
  ]
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values))
}
