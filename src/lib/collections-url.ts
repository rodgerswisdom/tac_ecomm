/** Build the single shop page URL with an optional category filter. */
export function getCollectionsHref(categorySlug?: string | null) {
  if (!categorySlug) return "/collections"
  return `/collections?category=${encodeURIComponent(categorySlug)}`
}
