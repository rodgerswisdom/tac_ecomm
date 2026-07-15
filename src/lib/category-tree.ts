import { prisma } from "@/lib/prisma"
import { CATEGORY_TAXONOMY } from "@/lib/category-taxonomy"

function getTaxonomySlugsForFilter(slug: string): string[] | null {
  const parent = CATEGORY_TAXONOMY.find((category) => category.slug === slug)
  if (parent) {
    return [parent.slug, ...(parent.children?.map((child) => child.slug) ?? [])]
  }

  for (const category of CATEGORY_TAXONOMY) {
    const child = category.children?.find((item) => item.slug === slug)
    if (child) {
      return [child.slug]
    }
  }

  return null
}

export async function getCategoryIdsForSlug(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      children: {
        select: {
          id: true,
          children: { select: { id: true } },
        },
      },
    },
  })

  if (!category) {
    return []
  }

  const ids = [category.id]
  for (const child of category.children) {
    ids.push(child.id)
    for (const grandchild of child.children) {
      ids.push(grandchild.id)
    }
  }

  return ids
}

export async function getCategorySlugsForFilter(slug: string): Promise<string[]> {
  const taxonomySlugs = getTaxonomySlugsForFilter(slug)
  if (taxonomySlugs) {
    return taxonomySlugs
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      slug: true,
      children: {
        select: {
          slug: true,
          children: { select: { slug: true } },
        },
      },
    },
  })

  if (!category) {
    return [slug]
  }

  const slugs = [category.slug]
  for (const child of category.children) {
    slugs.push(child.slug)
    for (const grandchild of child.children) {
      slugs.push(grandchild.slug)
    }
  }

  return slugs
}

export async function getChildCategoriesForSlug(slug: string) {
  const taxonomyParent = CATEGORY_TAXONOMY.find((category) => category.slug === slug)
  if (taxonomyParent?.children?.length) {
    return taxonomyParent.children.map((child) => ({
      id: child.slug,
      name: child.name,
      slug: child.slug,
    }))
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      children: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  })

  return category?.children ?? []
}
