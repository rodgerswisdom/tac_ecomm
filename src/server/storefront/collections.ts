import { prisma } from "@/lib/prisma"
import { TOP_LEVEL_CATEGORY_SLUGS } from "@/lib/category-taxonomy"
import { getProductCardData, type ProductCardQueryOptions } from "@/server/storefront/products"
import type { CollectionSummary, CollectionHighlight, CollectionSpotlight, CollectionCta } from "@/types/collection"
import type { ProductCardData } from "@/types/product"

const FALLBACK_COLLECTION_IMAGE = "/patterns/linen.png"

const activeProductWhere = {
  isActive: true,
  isDraft: false,
  isArchived: false,
} as const

export type HomePageCategoryCard = Pick<CollectionSummary, "id" | "name" | "slug" | "image">

/** Main shop categories selected in admin for the home page Curated Collections section. */
export async function getHomePageMainCategories(): Promise<HomePageCategoryCard[]> {
  const dbCategories = await prisma.category.findMany({
    where: { showOnHomepage: true },
    orderBy: [{ homepageOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      products: {
        where: activeProductWhere,
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          images: {
            take: 1,
            orderBy: { order: "asc" },
            select: { url: true },
          },
        },
      },
    },
  })

  return dbCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image:
      category.image ??
      category.products[0]?.images[0]?.url ??
      FALLBACK_COLLECTION_IMAGE,
  }))
}

type CollectionSummaryOptions = {
  excludeSlugs?: string[]
  limit?: number
  includeVirtual?: boolean
}

export async function getCollectionSummaries(options: CollectionSummaryOptions = {}) {
  const { excludeSlugs = [], limit, includeVirtual = true } = options

  const [categories, allProducts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    getProductCardData(),
  ])

  const builtSummaries: CollectionSummary[] = []

  for (const category of categories) {
    const products = allProducts.filter(
      (product) => product.category === category.slug
    )

    if (products.length === 0 && !TOP_LEVEL_CATEGORY_SLUGS.includes(category.slug)) {
      continue
    }

    builtSummaries.push(mapCategoryToSummary(category, products))
  }

  let summaries = builtSummaries

  if (includeVirtual) {
    const virtualCollections = await Promise.all([
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
  })

  if (!category) return null

  const products = await getProductCardData({ categorySlug: slug })

  return mapCategoryToSummary(category, products)
}

export async function getCollectionSlugs() {
  const categories = await prisma.category.findMany({ select: { slug: true } })
  return categories
    .map((category) => category.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
}

/** Lightweight list of collection slug+name for navbar Shop submenu. */
export async function getNavShopCategories(): Promise<{ slug: string; name: string }[]> {
  const [categories, corporateGiftCount] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.product.count({
      where: { ...activeProductWhere, isCorporateGift: true },
    }),
  ])

  const navItems: { slug: string; name: string }[] = []
  const seenSlugs = new Set<string>()

  for (const category of categories) {
    if (seenSlugs.has(category.slug)) continue
    seenSlugs.add(category.slug)
    navItems.push({
      slug: category.slug,
      name: category.name,
    })
  }

  if (corporateGiftCount > 0 && !seenSlugs.has("corporate-gifts")) {
    navItems.push({ slug: "corporate-gifts", name: "Corporate Gifts" })
    seenSlugs.add("corporate-gifts")
  }

  return navItems
}

type CategoryRecord = {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
}

function mapCategoryToSummary(
  category: CategoryRecord,
  products: ProductCardData[],
): CollectionSummary {
  const heroImage = category.image ?? products[0]?.image ?? FALLBACK_COLLECTION_IMAGE
  const description = category.description ?? "Curated by the TAC atelier"
  const featuredRegions = uniqueStrings(products.map((product) => product.origin).filter(Boolean))
  const artisanCount = new Set(products.map((product) => product.artisan?.name).filter(Boolean)).size

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description,
    image: heroImage,
    itemCount: products.length,
    featuredRegions,
    artisanCount,
    heroTitle: category.name,
    heroDescription: description,
    heroImage,
    longDescription: description,
    highlights: buildHighlights(products.length, artisanCount, featuredRegions),
    spotlight: buildSpotlightFromProductCards(products),
    ctas: buildDefaultCtas(category.name),
    featuredProductIds: products.slice(0, 3).map((product) => product.id),
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
  return [{ label: `Shop ${name}`, href: "#collection-products", variant: "primary" }]
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values))
}
