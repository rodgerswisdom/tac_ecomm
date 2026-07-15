import "dotenv/config"

import { prisma } from "../src/lib/prisma"
import { runCategoryTaxonomySeed } from "../src/lib/seed-category-taxonomy"

async function main() {
  await runCategoryTaxonomySeed(prisma)

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
