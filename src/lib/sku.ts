export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase()
}

/**
 * Product codes: a category prefix plus a running number, e.g. EAR-0042. Short enough to read
 * aloud and write on stock labels, so packers can match an order line to the right item.
 */
export const PRODUCT_CODE_PATTERN = /^[A-Z]{3}-\d{4,}$/

/** Category slug → code prefix. Unlisted categories use the first three letters of the slug. */
const PRODUCT_CODE_PREFIXES: Record<string, string> = {
  "african-arts": "ART",
  "bracelets-bangles": "BRA",
  earrings: "EAR",
  "necklaces-chains": "NEC",
  "arm-bands": "ARM",
  accessories: "ACC",
  "matching-sets": "SET",
  toys: "TOY",
}

export function productCodePrefix(categorySlug: string | null | undefined): string {
  const slug = categorySlug?.trim().toLowerCase() ?? ""
  if (PRODUCT_CODE_PREFIXES[slug]) return PRODUCT_CODE_PREFIXES[slug]
  return slug.replace(/[^a-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X")
}

export function formatProductCode(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(4, "0")}`
}

/** The running number of a code with this prefix, or 0 when it isn't one. */
export function productCodeNumber(sku: string, prefix: string): number {
  if (!PRODUCT_CODE_PATTERN.test(sku) || !sku.startsWith(`${prefix}-`)) return 0
  return Number(sku.slice(prefix.length + 1))
}
