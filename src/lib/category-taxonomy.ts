/** Canonical product categories for TAC Accessories */

export type CategoryTaxonomyNode = {
  name: string
  slug: string
  description?: string
}

export const CATEGORY_TAXONOMY: CategoryTaxonomyNode[] = [
  {
    name: "African Arts",
    slug: "african-arts",
    description: "Handcrafted African art pieces for your home and collection.",
  },
  {
    name: "Bracelets / Bangles",
    slug: "bracelets-bangles",
    description: "Brass, beaded, and mixed-material cuffs and bangles.",
  },
  {
    name: "Earrings",
    slug: "earrings",
    description: "Bead, brass, shell, bone, silver, and loop earrings.",
  },
  {
    name: "Necklaces / Chains",
    slug: "necklaces-chains",
    description: "Statement collars, tribal pieces, Maasai chokers, and African bead necklaces.",
  },
  {
    name: "Arm Bands",
    slug: "arm-bands",
    description: "Kenyan heritage and global flag arm bands.",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Fridge magnets, keyrings, and everyday artisan accessories.",
  },
  {
    name: "Matching Sets",
    slug: "matching-sets",
    description: "Curated ensembles crafted as cohesive heirloom sets.",
  },
]

/** Top-level category slugs shown in shop navigation */
export const TOP_LEVEL_CATEGORY_SLUGS = CATEGORY_TAXONOMY.map((c) => c.slug)

/** Deprecated slugs to migrate away from */
export const DEPRECATED_CATEGORY_SLUGS = [
  "jewelry",
  "home-decor",
  "rings",
  "signets",
  "hair-accessories",
  "necklaces",
  "bracelets",
]

export const LEGACY_CATEGORY_SLUG_MAP: Record<string, string> = {
  jewelry: "bracelets-bangles",
  "home-decor": "african-arts",
  rings: "bracelets-bangles",
  signets: "bracelets-bangles",
  necklaces: "necklaces-chains",
  bracelets: "bracelets-bangles",
  earrings: "earrings",
  accessories: "accessories",
  "hair-accessories": "accessories",
  "african-beads": "necklaces-chains",
}

export function flattenTaxonomy(): Array<{
  name: string
  slug: string
  description?: string
}> {
  return CATEGORY_TAXONOMY.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
  }))
}

export function getAllTaxonomySlugs(): Set<string> {
  return new Set(flattenTaxonomy().map((row) => row.slug))
}

export function getTopLevelCategoryOptions() {
  return CATEGORY_TAXONOMY.map((c) => ({ value: c.slug, label: c.name }))
}

export function getBespokeCategoryOptions() {
  return CATEGORY_TAXONOMY.filter((c) => c.slug !== "african-arts" && c.slug !== "accessories").map(
    (c) => ({ value: c.slug, label: c.name })
  )
}

export const BESPOKE_CATEGORY_VALUES = [
  ...getBespokeCategoryOptions().map((option) => option.value),
] as const
