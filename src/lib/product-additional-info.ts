import type { ProductCardData } from "@/types/product"

export type AdditionalInfoFact = {
  key: string
  label: string
  value: string
  kind: "dimension" | "weight" | "material" | "detail" | "story"
}

const MATERIAL_HINTS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bclay\b/i, label: "Clay" },
  { pattern: /\bbrass\b/i, label: "Brass" },
  { pattern: /\bbone\b/i, label: "Bone" },
  { pattern: /\bhorn\b/i, label: "Horn" },
  { pattern: /\bcowrie\b/i, label: "Cowrie shell" },
  { pattern: /\bbead/i, label: "Beads" },
  { pattern: /\bamber\b/i, label: "Amber" },
  { pattern: /\bbanana\s*fibre|\bbanana\s*fiber/i, label: "Banana fibre" },
  { pattern: /\bbatik\b/i, label: "Batik" },
  { pattern: /\bcanvas\b/i, label: "Canvas" },
  { pattern: /\bturquoise\b/i, label: "Turquoise" },
  { pattern: /\bcord\b/i, label: "Cord" },
  { pattern: /\bsilver\b/i, label: "Silver" },
  { pattern: /\bwood(?:en)?\b/i, label: "Wood" },
  { pattern: /\bleather\b/i, label: "Leather" },
  { pattern: /\bfabric|textile|cloth\b/i, label: "Fabric" },
  { pattern: /\bmagnet\b/i, label: "Resin / magnet" },
]

/** Pretty-print stored dimension strings for storefront display. */
export function formatProductDimensions(raw: string): string {
  let value = raw.trim().replace(/\s+/g, " ")
  if (!value) return value

  value = value.replace(/\s*\*\s*/g, " × ")
  value = value.replace(/\s+by\s+/gi, " × ")
  value = value.replace(/(\d)\s*cm\b/gi, "$1 cm")
  value = value.replace(/(\d)\s*mm\b/gi, "$1 mm")

  // "7 × 7 × 2" with no unit → assume cm for jewelry/accessory scale
  if (/^\d+(?:\.\d+)?(?:\s*×\s*\d+(?:\.\d+)?){1,2}$/.test(value)) {
    value = `${value} cm`
  }

  return value
}

export function formatProductWeight(kg: number): string {
  if (!Number.isFinite(kg) || kg <= 0) return ""
  if (kg < 0.1) {
    const grams = Math.round(kg * 1000)
    return `${grams} g`
  }
  const rounded = Number(kg.toFixed(kg >= 1 ? 2 : 3))
  return `${rounded} kg`
}

function inferMaterials(product: ProductCardData): string[] {
  if (product.materials.length > 0) {
    return product.materials.map((m) => m.trim()).filter(Boolean)
  }

  const haystack = [product.name, product.brand, product.category, product.description]
    .filter(Boolean)
    .join(" ")

  const found: string[] = []
  for (const hint of MATERIAL_HINTS) {
    if (hint.pattern.test(haystack) && !found.includes(hint.label)) {
      found.push(hint.label)
    }
  }
  return found
}

export function buildAdditionalInfoFacts(product: ProductCardData): AdditionalInfoFact[] {
  const facts: AdditionalInfoFact[] = []

  const dimensions = product.dimensions?.trim()
  if (dimensions) {
    facts.push({
      key: "dimensions",
      label: "Dimensions",
      value: formatProductDimensions(dimensions),
      kind: "dimension",
    })
  }

  if (product.weight != null && product.weight > 0) {
    const formatted = formatProductWeight(product.weight)
    if (formatted) {
      facts.push({
        key: "weight",
        label: "Weight",
        value: formatted,
        kind: "weight",
      })
    }
  }

  const materials = inferMaterials(product)
  if (materials.length > 0) {
    facts.push({
      key: "materials",
      label: "Materials",
      value: materials.join(", "),
      kind: "material",
    })
  }

  if (product.color?.trim()) {
    facts.push({
      key: "color",
      label: "Colour",
      value: product.color.trim(),
      kind: "detail",
    })
  }

  if (product.size?.trim()) {
    facts.push({
      key: "size",
      label: "Size",
      value: product.size.trim(),
      kind: "detail",
    })
  }

  if (product.origin?.trim()) {
    facts.push({
      key: "origin",
      label: "Origin",
      value: product.origin.trim(),
      kind: "detail",
    })
  }

  if (product.brand?.trim()) {
    facts.push({
      key: "category",
      label: "Category",
      value: product.brand.trim(),
      kind: "detail",
    })
  }

  if (product.sourcingStory?.trim()) {
    facts.push({
      key: "sourcing",
      label: "Sourcing",
      value: product.sourcingStory.trim(),
      kind: "story",
    })
  }

  if (product.communityImpact?.trim()) {
    facts.push({
      key: "impact",
      label: "Impact",
      value: product.communityImpact.trim(),
      kind: "story",
    })
  }

  const full = product.fullDescription?.trim()
  const short = product.description?.trim()
  if (full && full !== short) {
    facts.push({
      key: "about",
      label: "About",
      value: full,
      kind: "story",
    })
  }

  return facts
}

export function getAdditionalInfoPreview(facts: AdditionalInfoFact[]): string | null {
  const dimensions = facts.find((f) => f.kind === "dimension")
  if (dimensions) return dimensions.value

  const weight = facts.find((f) => f.kind === "weight")
  if (weight) return weight.value

  const materials = facts.find((f) => f.kind === "material")
  if (materials) return materials.value

  return null
}
