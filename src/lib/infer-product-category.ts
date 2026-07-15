import { flattenTaxonomy } from "@/lib/category-taxonomy"

type CategoryRule = {
  slug: string
  priority: number
  pattern: RegExp
  parents?: string[]
}

/**
 * Infer the best child category slug from a product name.
 * Optional parentSlug disambiguates items sitting on the wrong parent after migration.
 */
const CATEGORY_RULES: CategoryRule[] = [
  { slug: "fridge-magnets", priority: 100, pattern: /magnet/i },
  { slug: "keyrings", priority: 100, pattern: /key\s*holder|keyholder/i },
  { slug: "batik-paintings", priority: 100, pattern: /batik/i },
  { slug: "canvas-paintings", priority: 95, pattern: /canvas|banana\s*fibre|wall\s*hang/i },
  {
    slug: "global-assorted-flags-arm-bands",
    priority: 100,
    pattern: /global.*flag.*arm|flag.*arm\s*band/i,
  },
  { slug: "assorted-kenyan-arm-band", priority: 98, pattern: /arm\s*band/i },
  { slug: "hammered-brass-cuffs", priority: 95, pattern: /hammered/i },
  { slug: "assorted-men-handcuff", priority: 94, pattern: /men.*handcuff/i },
  { slug: "assorted-mixed-handcuffs", priority: 93, pattern: /mixed.*handcuff/i },
  {
    slug: "assorted-chunky-handcuffs",
    priority: 92,
    pattern: /chunky.*handcuff|chunky.*clay|chunky.*bangle|chunky.*stretch/i,
  },
  { slug: "tube-bangles", priority: 91, pattern: /tube.*bone|tube.*bangle/i },
  { slug: "silver-spring-wraps", priority: 90, pattern: /silver.*wrap|silver.*spring/i },
  {
    slug: "brass-statement",
    priority: 89,
    pattern: /brass.*(cuff|shield|turquoise|africa map)/i,
    parents: ["bracelets-bangles"],
  },
  {
    slug: "assorted-mixed-handcuffs",
    priority: 88,
    pattern: /\bcuff\b|\bhandcuff\b|\bbangle\b/i,
    parents: ["bracelets-bangles"],
  },
  { slug: "men-chocker", priority: 96, pattern: /men.*chock/i },
  { slug: "maasai-chokers", priority: 95, pattern: /maasai.*chock/i },
  { slug: "maasai-chokers", priority: 94, pattern: /chock/i },
  {
    slug: "assorted-bone-collar",
    priority: 94,
    pattern: /collar.*bone|collarbone|collar/i,
    parents: ["necklaces-chains", "accessories"],
  },
  {
    slug: "african-beads",
    priority: 92,
    pattern: /bead.*strand|beaded.*layer|african bead|mixed bead/i,
    parents: ["necklaces-chains"],
  },
  {
    slug: "tribal-statement",
    priority: 91,
    pattern: /tribal|necklace|pendant|cascade|drape|statement/i,
    parents: ["necklaces-chains", "accessories"],
  },
  { slug: "loop-earrings", priority: 90, pattern: /loop/i, parents: ["earrings"] },
  { slug: "shell-earrings", priority: 89, pattern: /shell/i, parents: ["earrings"] },
  { slug: "bone-horn-earrings", priority: 88, pattern: /bone|horn/i, parents: ["earrings"] },
  { slug: "silver-earrings", priority: 87, pattern: /silver/i, parents: ["earrings"] },
  { slug: "bead-earrings", priority: 86, pattern: /bead/i, parents: ["earrings"] },
  { slug: "brass-earrings", priority: 85, pattern: /brass/i, parents: ["earrings"] },
]

const taxonomyRows = flattenTaxonomy()
const childSlugSet = new Set(
  taxonomyRows.filter((row) => row.parentSlug).map((row) => row.slug),
)
const childNameBySlug = new Map(
  taxonomyRows
    .filter((row) => row.parentSlug)
    .map((row) => [row.slug, row.name]),
)
const parentSlugByChild = new Map(
  taxonomyRows
    .filter((row) => row.parentSlug)
    .map((row) => [row.slug, row.parentSlug!]),
)

function matchesRule(rule: CategoryRule, productName: string, parentSlug?: string | null) {
  if (!rule.pattern.test(productName)) return false
  if (!rule.parents?.length) return true
  if (!parentSlug) return true
  return rule.parents.includes(parentSlug)
}

export function inferChildCategorySlug(
  productName: string,
  parentSlug?: string | null,
): string | null {
  const normalized = productName.trim()
  if (!normalized) return null

  let best: CategoryRule | null = null
  for (const rule of CATEGORY_RULES) {
    if (!matchesRule(rule, normalized, parentSlug)) continue
    if (!childSlugSet.has(rule.slug)) continue
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
  return childNameBySlug.get(slug) ?? null
}

export function inferParentSlugForChild(childSlug: string): string | null {
  return parentSlugByChild.get(childSlug) ?? null
}

export function listCategoryRules() {
  return CATEGORY_RULES
}
