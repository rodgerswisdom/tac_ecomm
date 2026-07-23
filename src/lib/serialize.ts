export function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null
  if (typeof value === "string") return value
  return value.toISOString()
}
