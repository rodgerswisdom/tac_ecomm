import { Suspense } from "react"
import { CollectionsPageClient } from "@/app/collections/CollectionsPageClient"
import {
  getCorporateProductCards,
  getToyProductCards,
} from "@/server/storefront/products"
import type { ProductCardData } from "@/types/product"
import type { CategoryOption } from "@/components/ProductFilters"
import type { SpecialCatalogKind } from "@/lib/special-catalogs"

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function categoriesFromProducts(products: ProductCardData[]): CategoryOption[] {
  const categoryMap = new Map<string, string>()
  for (const product of products) {
    if (product.category && product.brand) {
      categoryMap.set(product.category, product.brand)
    }
  }
  return Array.from(categoryMap.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const CATALOGS: Record<
  SpecialCatalogKind,
  {
    fetch: () => Promise<ProductCardData[]>
    basePath: string
    pageTitle: string
    pageDescription: string
    emptyTitle: string
    emptyDescription: string
  }
> = {
  toys: {
    fetch: getToyProductCards,
    basePath: "/toys",
    pageTitle: "Toys",
    pageDescription:
      "Handcrafted toys and play pieces made by African artisans — objects for curiosity, storytelling, and gift-giving.",
    emptyTitle: "No toys yet",
    emptyDescription: "Check back soon as we add handcrafted toys to this collection.",
  },
  corporate: {
    fetch: getCorporateProductCards,
    basePath: "/corporate",
    pageTitle: "Corporate",
    pageDescription:
      "Purposeful gifting for teams and partners. Curated artisan pieces for client programmes, staff recognition, and branded hospitality.",
    emptyTitle: "No corporate gifts yet",
    emptyDescription: "Check back soon, or ask us about a tailored gifting programme.",
  },
}

export async function SpecialCatalogPage({
  kind,
  searchParams,
}: {
  kind: SpecialCatalogKind
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const catalog = CATALOGS[kind]
  const params = (await searchParams) ?? {}
  const initialCategory = parseParam(params.category)
  const initialSearch = parseParam(params.q)
  const products = await catalog.fetch()
  const categories = categoriesFromProducts(products)

  return (
    <Suspense fallback={null}>
      <CollectionsPageClient
        initialProducts={products}
        categories={categories}
        collections={[]}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        basePath={catalog.basePath}
        pageTitle={catalog.pageTitle}
        pageDescription={catalog.pageDescription}
        emptyTitle={catalog.emptyTitle}
        emptyDescription={catalog.emptyDescription}
      />
    </Suspense>
  )
}
