export function getDiscountPercent(
  price: number,
  originalPrice?: number | null
): number {
  if (
    typeof originalPrice !== "number" ||
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(price) ||
    originalPrice <= price ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function hasValidDiscount(
  price: number,
  originalPrice?: number | null
): boolean {
  return getDiscountPercent(price, originalPrice) > 0;
}
