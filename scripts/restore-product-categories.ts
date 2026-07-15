import "dotenv/config"

import { prisma } from "../src/lib/prisma"
import { inferChildCategoryName, inferChildCategorySlug } from "../src/lib/infer-product-category"
import { flattenTaxonomy } from "../src/lib/category-taxonomy"

const apply = process.argv.includes("--apply")

async function main() {
  const childRows = flattenTaxonomy().filter((row) => row.parentSlug)
  const slugToId = new Map<string, string>()

  const categories = await prisma.category.findMany({
    where: { slug: { in: childRows.map((row) => row.slug) } },
    select: { id: true, slug: true, name: true },
  })

  for (const category of categories) {
    slugToId.set(category.slug, category.id)
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      subcategory: true,
      categoryId: true,
      category: { select: { slug: true, name: true, parentId: true } },
    },
    orderBy: { name: "asc" },
  })

  const planned: Array<{
    id: string
    name: string
    from: string
    toSlug: string
    toName: string
  }> = []

  const unchanged: string[] = []

  for (const product of products) {
    const inferredSlug = inferChildCategorySlug(product.name, product.category.slug)
    if (!inferredSlug) {
      unchanged.push(`${product.name} (stays on ${product.category.slug})`)
      continue
    }

    const targetId = slugToId.get(inferredSlug)
    const targetName = childRows.find((row) => row.slug === inferredSlug)?.name
    if (!targetId || !targetName) {
      unchanged.push(`${product.name} (missing category row for ${inferredSlug})`)
      continue
    }

    if (product.category.slug === inferredSlug && product.subcategory === targetName) {
      continue
    }

    planned.push({
      id: product.id,
      name: product.name,
      from: product.category.slug,
      toSlug: inferredSlug,
      toName: targetName,
    })
  }

  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`)
  console.log(`Products to update: ${planned.length}`)
  console.log(`Unchanged / unmatched: ${unchanged.length}`)

  for (const row of planned) {
    console.log(`- ${row.name}: ${row.from} -> ${row.toSlug}`)
  }

  if (!apply) {
    console.log("\nRun with --apply to write changes.")
    return
  }

  let updated = 0
  for (const row of planned) {
    const categoryId = slugToId.get(row.toSlug)
    if (!categoryId) continue

    await prisma.product.update({
      where: { id: row.id },
      data: {
        categoryId,
        subcategory: row.toName,
      },
    })
    updated += 1
  }

  console.log(`\nUpdated ${updated} products.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
