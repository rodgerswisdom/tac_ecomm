import { generateSlug } from "@/lib/utils"

export function buildSkuBaseFromName(name: string): string {
  if (!name) return ""
  const normalized = generateSlug(name).replace(/-/g, "").toUpperCase()
  if (!normalized) return ""
  const prefix = normalized.slice(0, 5).padEnd(5, "X")
  const yearSuffix = new Date().getFullYear().toString().slice(-2)
  return `${prefix}-${yearSuffix}`
}

export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase()
}
