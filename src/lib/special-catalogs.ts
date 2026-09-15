export const SPECIAL_CATALOG_SLUGS = {
  toys: "toys",
  corporate: "corporate-gifts",
} as const

export type SpecialCatalogKind = "toys" | "corporate"

/** Shop-dropdown slugs that have their own top-level pages. */
export const SHOP_NAV_EXCLUDED_SLUGS = new Set<string>([
  SPECIAL_CATALOG_SLUGS.toys,
  SPECIAL_CATALOG_SLUGS.corporate,
])

export function isSpecialCatalogSlug(slug: string | null | undefined): slug is string {
  if (!slug) return false
  return slug === SPECIAL_CATALOG_SLUGS.toys || slug === SPECIAL_CATALOG_SLUGS.corporate || slug === "corporate"
}
