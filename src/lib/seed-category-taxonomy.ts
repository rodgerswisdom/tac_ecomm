import type { PrismaClient } from "@prisma/client"

import {
  CATEGORY_TAXONOMY,
  DEPRECATED_CATEGORY_SLUGS,
  LEGACY_CATEGORY_SLUG_MAP,
  flattenTaxonomy,
  getAllTaxonomySlugs,
} from "@/lib/category-taxonomy"
import { inferChildCategorySlug } from "@/lib/infer-product-category"

type SeedClient = Pick<
  PrismaClient,
  "category" | "product" | "$transaction"
>

export async function seedCategoryTaxonomy(client: SeedClient) {
  const slugToId = new Map<string, string>()

  for (const [homepageOrder, category] of CATEGORY_TAXONOMY.entries()) {
    const row = await client.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description ?? null,
        showOnHomepage: true,
        homepageOrder,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description ?? null,
        showOnHomepage: true,
        homepageOrder,
      },
    })
    slugToId.set(category.slug, row.id)
  }

  return slugToId
}

export async function migrateProductsToTaxonomy(client: SeedClient) {
  const validSlugs = getAllTaxonomySlugs()

  const products = await client.product.findMany({
    include: { category: { select: { slug: true } } },
  })

  const defaultCategory = await client.category.findUnique({
    where: { slug: "accessories" },
    select: { id: true },
  })

  if (!defaultCategory) {
    throw new Error("Default accessories category missing — run seedCategoryTaxonomy first")
  }

  for (const product of products) {
    const currentSlug = product.category.slug

    if (validSlugs.has(currentSlug)) {
      continue
    }

    const inferredSlug = inferChildCategorySlug(product.name, product.category.slug)
    if (inferredSlug && validSlugs.has(inferredSlug)) {
      const target = await client.category.findUnique({
        where: { slug: inferredSlug },
        select: { id: true },
      })
      if (target && target.id !== product.categoryId) {
        await client.product.update({
          where: { id: product.id },
          data: { categoryId: target.id },
        })
      }
      continue
    }

    const targetSlug = LEGACY_CATEGORY_SLUG_MAP[currentSlug] ?? "accessories"
    const target = await client.category.findUnique({
      where: { slug: targetSlug },
      select: { id: true },
    })

    if (target && target.id !== product.categoryId) {
      await client.product.update({
        where: { id: product.id },
        data: { categoryId: target.id },
      })
    }
  }
}

export async function removeDeprecatedEmptyCategories(client: SeedClient) {
  for (const slug of DEPRECATED_CATEGORY_SLUGS) {
    const category = await client.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    })

    if (!category) continue
    if (category._count.products > 0) continue

    await client.category.delete({ where: { id: category.id } })
  }
}

export async function runCategoryTaxonomySeed(client: SeedClient) {
  await seedCategoryTaxonomy(client)
  await migrateProductsToTaxonomy(client)
  await removeDeprecatedEmptyCategories(client)
}

export function listTaxonomyRows() {
  return flattenTaxonomy()
}
