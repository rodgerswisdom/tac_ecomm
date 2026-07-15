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

  for (const [homepageOrder, parent] of CATEGORY_TAXONOMY.entries()) {
    const parentRow = await client.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description ?? null,
        parentId: null,
        showOnHomepage: true,
        homepageOrder,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description ?? null,
        parentId: null,
        showOnHomepage: true,
        homepageOrder,
      },
    })
    slugToId.set(parent.slug, parentRow.id)

    for (const child of parent.children ?? []) {
      const childRow = await client.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          parentId: parentRow.id,
          showOnHomepage: false,
          homepageOrder: 0,
        },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parentRow.id,
          showOnHomepage: false,
          homepageOrder: 0,
        },
      })
      slugToId.set(child.slug, childRow.id)
    }
  }

  return slugToId
}

export async function migrateProductsToTaxonomy(client: SeedClient) {
  const validSlugs = getAllTaxonomySlugs()
  const childRows = flattenTaxonomy().filter((row) => row.parentSlug)
  const slugToId = new Map(
    (
      await client.category.findMany({
        where: { slug: { in: childRows.map((row) => row.slug) } },
        select: { id: true, slug: true },
      })
    ).map((category) => [category.slug, category.id]),
  )

  const products = await client.product.findMany({
    include: { category: { select: { slug: true, parentId: true } } },
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

    if (currentSlug && childRows.some((row) => row.slug === currentSlug)) {
      continue
    }

    const inferredSlug = inferChildCategorySlug(product.name, product.category.slug)
    if (inferredSlug) {
      const targetId = slugToId.get(inferredSlug)
      if (targetId && targetId !== product.categoryId) {
        const targetName = childRows.find((row) => row.slug === inferredSlug)?.name
        await client.product.update({
          where: { id: product.id },
          data: {
            categoryId: targetId,
            subcategory: targetName ?? null,
          },
        })
      }
      continue
    }

    if (validSlugs.has(currentSlug) && product.category.parentId === null) {
      continue
    }

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
