/** Canonical product category tree for TAC Accessories */

export type CategoryTaxonomyNode = {
  name: string
  slug: string
  description?: string
  children?: CategoryTaxonomyNode[]
  /** Leaf labels stored on Product.subcategory (e.g. Arm Band variants) */
  leafSubcategories?: string[]
}

export const CATEGORY_TAXONOMY: CategoryTaxonomyNode[] = [
  {
    name: "African Arts",
    slug: "african-arts",
    description: "Handcrafted African art pieces for your home and collection.",
    children: [
      { name: "Batik Paintings", slug: "batik-paintings" },
      { name: "Canvas Paintings", slug: "canvas-paintings" },
    ],
  },
  {
    name: "Bracelets / Bangles",
    slug: "bracelets-bangles",
    description: "Brass, beaded, and mixed-material cuffs and bangles.",
    children: [
      { name: "Hammered Brass Cuffs", slug: "hammered-brass-cuffs" },
      { name: "Brass Statement", slug: "brass-statement" },
      { name: "Assorted Men Handcuff", slug: "assorted-men-handcuff" },
      { name: "Assorted Mixed Handcuffs", slug: "assorted-mixed-handcuffs" },
      { name: "Assorted Chunky Handcuffs", slug: "assorted-chunky-handcuffs" },
      { name: "Tube Bangles", slug: "tube-bangles" },
      { name: "Silver Spring Wraps", slug: "silver-spring-wraps" },
    ],
  },
  {
    name: "Earrings",
    slug: "earrings",
    description: "Bead, brass, shell, bone, silver, and loop earrings.",
    children: [
      { name: "Bead Earrings", slug: "bead-earrings" },
      { name: "Brass Earrings", slug: "brass-earrings" },
      { name: "Shell Earrings", slug: "shell-earrings" },
      { name: "Bone / Horn Earrings", slug: "bone-horn-earrings" },
      { name: "Silver Earrings", slug: "silver-earrings" },
      { name: "Loop Earrings", slug: "loop-earrings" },
    ],
  },
  {
    name: "Necklaces / Chains",
    slug: "necklaces-chains",
    description: "Statement collars, tribal pieces, Maasai chokers, and African bead necklaces.",
    children: [
      { name: "Assorted Bone Collar", slug: "assorted-bone-collar" },
      { name: "Tribal Statement", slug: "tribal-statement" },
      { name: "African Beads", slug: "african-beads" },
      { name: "Maasai Chokers", slug: "maasai-chokers" },
      { name: "Men Chocker", slug: "men-chocker" },
    ],
  },
  {
    name: "Arm Bands",
    slug: "arm-bands",
    description: "Kenyan heritage and global flag arm bands.",
    children: [
      {
        name: "Assorted Kenyan Arm Band",
        slug: "assorted-kenyan-arm-band",
        leafSubcategories: [
          "Classic Kenyan",
          "Heritage Ivory",
          "Shield of Kenya",
          "Heart of Kenya",
          "Savannah Waves",
        ],
      },
      {
        name: "Global Assorted Flags Arm Bands",
        slug: "global-assorted-flags-arm-bands",
        leafSubcategories: [
          "Classic Kenyan",
          "USA Flag",
          "United Kingdom Flag",
          "France Flag",
          "Germany Flag",
          "Kenyan and France Flag",
          "Kenyan and Germany Flag",
          "France and Germany Flag",
        ],
      },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Fridge magnets, keyrings, and everyday artisan accessories.",
    children: [
      { name: "Fridge Magnets", slug: "fridge-magnets" },
      { name: "Keyrings", slug: "keyrings" },
    ],
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
  "african-beads": "african-beads",
}

export function flattenTaxonomy(): Array<{
  name: string
  slug: string
  parentSlug: string | null
  description?: string
  leafSubcategories?: string[]
}> {
  const rows: Array<{
    name: string
    slug: string
    parentSlug: string | null
    description?: string
    leafSubcategories?: string[]
  }> = []

  for (const parent of CATEGORY_TAXONOMY) {
    rows.push({
      name: parent.name,
      slug: parent.slug,
      parentSlug: null,
      description: parent.description,
    })
    for (const child of parent.children ?? []) {
      rows.push({
        name: child.name,
        slug: child.slug,
        parentSlug: parent.slug,
        leafSubcategories: child.leafSubcategories,
      })
    }
  }

  return rows
}

export function getAllTaxonomySlugs(): Set<string> {
  return new Set(flattenTaxonomy().map((row) => row.slug))
}

export function getLeafSubcategoriesForSlug(slug: string): string[] {
  for (const parent of CATEGORY_TAXONOMY) {
    if (parent.slug === slug) {
      return (parent.children ?? []).map((c) => c.name)
    }
    for (const child of parent.children ?? []) {
      if (child.slug === slug) {
        return child.leafSubcategories ?? []
      }
    }
  }
  return []
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
  "matching-sets",
] as const
