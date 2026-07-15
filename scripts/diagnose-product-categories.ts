import "dotenv/config"

import { prisma } from "../src/lib/prisma"
import { flattenTaxonomy, getAllTaxonomySlugs } from "../src/lib/category-taxonomy"

async function main() {
  const validSlugs = getAllTaxonomySlugs()
  const taxonomyRows = flattenTaxonomy()
  const childByName = new Map(
    taxonomyRows
      .filter((row) => row.parentSlug)
      .map((row) => [row.name.toLowerCase(), row.slug]),
  )
  const childBySlug = new Set(
    taxonomyRows.filter((row) => row.parentSlug).map((row) => row.slug),
  )

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        subcategory: true,
        category: { select: { id: true, name: true, slug: true, parentId: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
  ])

  const onParent = products.filter((product) => product.category.parentId === null)
  const onChild = products.filter(
    (product) => product.category.parentId !== null && validSlugs.has(product.category.slug),
  )
  const onOrphan = products.filter((product) => !validSlugs.has(product.category.slug))
  const onAccessories = products.filter((product) => product.category.slug === "accessories")

  console.log("=== Product category diagnosis ===")
  console.log(`Total products: ${products.length}`)
  console.log(`On child taxonomy categories: ${onChild.length}`)
  console.log(`On parent-only categories: ${onParent.length}`)
  console.log(`On non-taxonomy / legacy categories: ${onOrphan.length}`)
  console.log(`On Accessories parent: ${onAccessories.length}`)

  console.log("\n=== Products per category ===")
  for (const category of categories) {
    if (category._count.products > 0) {
      const level = category.parentId ? "child" : "parent"
      const inTaxonomy = validSlugs.has(category.slug) ? "taxonomy" : "legacy"
      console.log(
        `- ${category.name} (${category.slug}) [${level}/${inTaxonomy}]: ${category._count.products}`,
      )
    }
  }

  const recoverable = onParent.filter((product) => {
    const sub = product.subcategory?.trim().toLowerCase()
    return sub ? childByName.has(sub) : false
  })

  console.log(`\n=== Recoverable via subcategory field: ${recoverable.length} ===`)
  for (const product of recoverable.slice(0, 20)) {
    const targetSlug = childByName.get(product.subcategory!.trim().toLowerCase())
    console.log(
      `- ${product.name}: ${product.category.slug} -> ${targetSlug} (subcategory: ${product.subcategory})`,
    )
  }
  if (recoverable.length > 20) {
    console.log(`... and ${recoverable.length - 20} more`)
  }

  console.log("\n=== Parent-assigned products (sample) ===")
  for (const product of onParent.slice(0, 25)) {
    console.log(
      `- ${product.name}: category=${product.category.slug}, subcategory=${product.subcategory ?? "—"}`,
    )
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
