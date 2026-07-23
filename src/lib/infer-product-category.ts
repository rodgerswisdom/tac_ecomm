import { flattenTaxonomy, getAllTaxonomySlugs } from "@/lib/category-taxonomy"

type CategoryRule = {
  slug: string
  priority: number
  pattern: RegExp
}

/** Infer the best category slug from a product name. */
const CATEGORY_RULES: CategoryRule[] = [
  { slug: "accessories", priority: 100, pattern: /magnet|key\s*holder|keyholder/i },
  { slug: "african-arts", priority: 100, pattern: /batik|canvas|banana\s*fibre|wall\s*hang/i },
  { slug: "arm-bands", priority: 100, pattern: /arm\s*band|global.*flag.*arm|flag.*arm\s*band/i },
  { slug: "bracelets-bangles", priority: 95, pattern: /hammered|handcuff|cuff|bangle|wrap/i },
  { slug: "necklaces-chains", priority: 94, pattern: /chock|collar|bead.*strand|beaded.*layer|tribal|necklace|pendant/i },
  { slug: "earrings", priority: 90, pattern: /loop|shell|bone|horn|silver|bead|brass|earring/i },
]

const validSlugs = getAllTaxonomySlugs()

function matchesRule(rule: CategoryRule, productName: string) {
  return rule.pattern.test(productName)
}

export function inferChildCategorySlug(
  productName: string,
  _parentSlug?: string | null,
): string | null {
  const normalized = productName.trim()
  if (!normalized) return null

  let best: CategoryRule | null = null
  for (const rule of CATEGORY_RULES) {
    if (!matchesRule(rule, normalized)) continue
    if (!validSlugs.has(rule.slug)) continue
    if (!best || rule.priority > best.priority) {
      best = rule
    }
  }

  return best?.slug ?? null
}

export function inferChildCategoryName(
  productName: string,
  parentSlug?: string | null,
): string | null {
  const slug = inferChildCategorySlug(productName, parentSlug)
  if (!slug) return null
  return flattenTaxonomy().find((row) => row.slug === slug)?.name ?? null
}

export function inferParentSlugForChild(childSlug: string): string | null {
  return validSlugs.has(childSlug) ? childSlug : null
}

export function listCategoryRules() {
  return CATEGORY_RULES
}
