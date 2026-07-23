import { prisma } from "../src/lib/prisma"
import { inferChildCategorySlug } from "../src/lib/infer-product-category"

async function main() {
  const products = await prisma.product.findMany({
    include: { category: { select: { slug: true, name: true } } },
  })

  let updated = 0

  for (const product of products) {
    const inferredSlug = inferChildCategorySlug(product.name, product.category.slug)
    if (!inferredSlug || inferredSlug === product.category.slug) {
      continue
    }

    const target = await prisma.category.findUnique({
      where: { slug: inferredSlug },
      select: { id: true },
    })

    if (!target || target.id === product.categoryId) {
      continue
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId: target.id },
    })

    console.log(`Updated ${product.name}: ${product.category.slug} -> ${inferredSlug}`)
    updated += 1
  }

  console.log(`Restored categories for ${updated} product(s).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
