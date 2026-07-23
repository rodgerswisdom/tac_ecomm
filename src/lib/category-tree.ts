import { prisma } from "@/lib/prisma"

export async function getCategoryIdsForSlug(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  })

  return category ? [category.id] : []
}

export async function getCategorySlugsForFilter(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { slug: true },
  })

  return category ? [category.slug] : [slug]
}
