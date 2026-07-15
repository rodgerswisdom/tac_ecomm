import "dotenv/config"

import { prisma } from "../src/lib/prisma"
import { seedCategoryTaxonomy, migrateProductsToTaxonomy, removeDeprecatedEmptyCategories } from "../src/lib/seed-category-taxonomy"

async function main() {
  await seedCategoryTaxonomy(prisma)

  if (process.env.SEED_MIGRATE_PRODUCTS === "true") {
    await migrateProductsToTaxonomy(prisma)
    await removeDeprecatedEmptyCategories(prisma)
  }

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@tacaccessories.com" },
    update: {},
    create: {
      email: "admin@tacaccessories.com",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  const categoryCount = await prisma.category.count()

  console.log("Database seeded successfully!")
  console.log("Categories in taxonomy:", categoryCount)
  console.log("Admin user:", adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
