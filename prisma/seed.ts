// @ts-nocheck
 
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let PrismaClient: any

try {
  PrismaClient = require('@prisma/client').PrismaClient
} catch (error) {
  console.warn('Prisma Client not available. Skipping seed script.', error)
  process.exit(0)
}

const prisma = new PrismaClient()

async function main() {
  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'jewelry' },
      update: {},
      create: {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Handcrafted jewelry pieces',
        image: '/categories/jewelry.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion accessories and decorative items',
        image: '/categories/accessories.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-decor' },
      update: {},
      create: {
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Decorative items for your home',
        image: '/categories/home-decor.jpg',
      },
    }),
  ])

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tacaccessories.com' },
    update: {},
    create: {
      email: 'admin@tacaccessories.com',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log('Database seeded successfully!')
  console.log('Categories created:', categories.length)
  console.log('Admin user created:', adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
