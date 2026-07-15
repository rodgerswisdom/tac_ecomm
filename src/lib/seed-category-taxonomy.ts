import type { PrismaClient } from "@prisma/client"

import {
  CATEGORY_TAXONOMY,
  DEPRECATED_CATEGORY_SLUGS,
  LEGACY_CATEGORY_SLUG_MAP,
  flattenTaxonomy,
  getAllTaxonomySlugs,
} from "@/lib/category-taxonomy"

type SeedClient = Pick<
  PrismaClient,
  "category" | "product" | "$transaction"
>

export async function seedCategoryTaxonomy(client: SeedClient) {
  const slugToId = new Map<string, string>()

  for (const parent of CATEGORY_TAXONOMY) {
    const parentRow = await client.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description ?? null,
        parentId: null,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description ?? null,
        parentId: null,
      },
    })
    slugToId.set(parent.slug, parentRow.id)

    for (const child of parent.children ?? []) {
      const childRow = await client.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          parentId: parentRow.id,
        },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parentRow.id,
        },
      })
      slugToId.set(child.slug, childRow.id)
    }
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
      include: { _count: { select: { products: true, children: true } } },
    })

    if (!category) continue
    if (category._count.products > 0 || category._count.children > 0) continue

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
