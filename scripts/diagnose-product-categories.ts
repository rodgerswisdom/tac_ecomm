import { prisma } from "../src/lib/prisma"
import { flattenTaxonomy, getAllTaxonomySlugs } from "../src/lib/category-taxonomy"

async function main() {
  const validSlugs = getAllTaxonomySlugs()
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  })

  const miscategorized = products.filter((product) => !validSlugs.has(product.category.slug))

  console.log(`Total products: ${products.length}`)
  console.log(`Miscategorized (not on flat taxonomy slug): ${miscategorized.length}`)

  if (miscategorized.length > 0) {
    console.log("\n=== Miscategorized products ===")
    for (const product of miscategorized.slice(0, 50)) {
      console.log(`- ${product.name}: ${product.category.slug}`)
    }
  }

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  console.log("\n=== Categories ===")
  for (const category of categories) {
    console.log(`- ${category.name} (${category.slug}): ${category._count.products} products`)
  }

  console.log("\n=== Expected taxonomy ===")
  for (const row of flattenTaxonomy()) {
    console.log(`- ${row.name} (${row.slug})`)
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
