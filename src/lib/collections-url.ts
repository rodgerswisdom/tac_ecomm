import { SPECIAL_CATALOG_SLUGS } from "@/lib/special-catalogs"

/** Build the shop URL for a category, or a dedicated catalog page when one exists. */
export function getCollectionsHref(categorySlug?: string | null) {
  if (!categorySlug) return "/collections"
  if (categorySlug === SPECIAL_CATALOG_SLUGS.toys) return "/toys"
  if (categorySlug === SPECIAL_CATALOG_SLUGS.corporate || categorySlug === "corporate") {
    return "/corporate"
  }
  return `/collections?category=${encodeURIComponent(categorySlug)}`
}
