import { ProductType } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getChildCategoriesForSlug } from "@/lib/category-tree"
import { CATEGORY_TAXONOMY, TOP_LEVEL_CATEGORY_SLUGS } from "@/lib/category-taxonomy"
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

/** Six main shop categories for the home page, in taxonomy order. Works before seed via taxonomy fallbacks. */
export async function getHomePageMainCategories(): Promise<HomePageCategoryCard[]> {
  const dbCategories = await prisma.category.findMany({
    where: { slug: { in: [...TOP_LEVEL_CATEGORY_SLUGS] }, parentId: null },
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

  const bySlug = new Map(dbCategories.map((category) => [category.slug, category]))

  return TOP_LEVEL_CATEGORY_SLUGS.map((slug) => {
    const taxonomy = CATEGORY_TAXONOMY.find((category) => category.slug === slug)
    const dbCategory = bySlug.get(slug)
    const image =
      dbCategory?.image ??
      dbCategory?.products[0]?.images[0]?.url ??
      FALLBACK_COLLECTION_IMAGE

    return {
      id: dbCategory?.id ?? slug,
      name: dbCategory?.name ?? taxonomy?.name ?? slug,
      slug,
      image,
    }
  })
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
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: {
        children: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    getProductCardData(),
  ])

  const builtSummaries: CollectionSummary[] = []

  for (const category of categories) {
    const categorySlugs = new Set([
      category.slug,
      ...category.children.map((child) => child.slug),
    ])
    const products = allProducts.filter(
      (product) => product.category && categorySlugs.has(product.category)
    )

    if (products.length === 0 && !TOP_LEVEL_CATEGORY_SLUGS.includes(category.slug)) {
      continue
    }

    builtSummaries.push(mapCategoryToSummary(category, products, category.children))
  }

  let summaries = builtSummaries

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
  })

  if (!category) return null

  const products = await getProductCardData({ categorySlug: slug })
  const children = await getChildCategoriesForSlug(slug)

  return mapCategoryToSummary(category, products, children)
}

export async function getCollectionSlugs() {
  const categories = await prisma.category.findMany({ select: { slug: true } })
  return categories
    .map((category) => category.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
}

/** Lightweight list of collection slug+name for navbar Shop submenu. Top-level DB categories + virtual collections. */
export async function getNavShopCategories(): Promise<{ slug: string; name: string }[]> {
  const [topLevel, matchingSetCount, corporateGiftCount] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.product.count({
      where: { ...activeProductWhere, productType: ProductType.MATCHING_SET },
    }),
    prisma.product.count({
      where: { ...activeProductWhere, isCorporateGift: true },
    }),
  ])

  const navItems = topLevel.map((category) => ({
    slug: category.slug,
    name: category.name,
  }))

  if (matchingSetCount > 0) {
    navItems.push({ slug: "matching-sets", name: "Matching Sets" })
  }

  if (corporateGiftCount > 0) {
    navItems.push({ slug: "corporate-gifts", name: "Corporate Gifts" })
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

type ChildCategory = {
  id: string
  name: string
  slug: string
}

function mapCategoryToSummary(
  category: CategoryRecord,
  products: ProductCardData[],
  children: ChildCategory[] = []
): CollectionSummary {
  const heroImage = category.image ?? products[0]?.image ?? FALLBACK_COLLECTION_IMAGE
  const description = category.description ?? "Curated by the TAC atelier"
  const featuredRegions = uniqueStrings(products.map((product) => product.origin).filter(Boolean))
  const artisanCount = new Set(products.map((product) => product.artisan?.name).filter(Boolean)).size
  const childNames = children.map((child) => child.name)
  const productSubcategories = uniqueStrings(
    products.map((product) => product.subcategory).filter(Boolean) as string[]
  )
  const subcategories = uniqueStrings([...childNames, ...productSubcategories])

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description,
    image: heroImage,
    itemCount: products.length,
    featuredRegions,
    artisanCount,
    subcategories,
    childCategories: children.map((child) => ({
      slug: child.slug,
      name: child.name,
    })),
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
