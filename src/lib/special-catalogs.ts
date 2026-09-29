export const SPECIAL_CATALOG_SLUGS = {
  corporate: "corporate-gifts",
} as const

/** Toys are no longer sold; keep the category out of shop navigation. */
export const TOYS_CATEGORY_SLUG = "toys"

export type SpecialCatalogKind = "corporate"

/** Shop-dropdown slugs that have their own top-level pages or are hidden. */
export const SHOP_NAV_EXCLUDED_SLUGS = new Set<string>([
  TOYS_CATEGORY_SLUG,
  SPECIAL_CATALOG_SLUGS.corporate,
])

export function isSpecialCatalogSlug(slug: string | null | undefined): slug is string {
  if (!slug) return false
  return slug === SPECIAL_CATALOG_SLUGS.corporate || slug === "corporate"
}
