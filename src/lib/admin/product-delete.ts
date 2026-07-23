export function buildProductDeleteDescription(options: {
  productName: string
  orderCount?: number
  orderItemCount?: number
  orderNumbers?: string[]
}): string {
  const { productName, orderNumbers = [] } = options
  const orderCount = options.orderCount ?? 0
  const orderItemCount = options.orderItemCount ?? 0
  const hasOrderHistory = orderCount > 0 || orderItemCount > 0

  if (!hasOrderHistory) {
    return `This will permanently remove ${productName} from your catalog.`
  }

  const historyLine =
    orderCount > 0
      ? `This product appears in ${orderCount} order${orderCount === 1 ? "" : "s"}.`
      : `This product appears in order history (${orderItemCount} sale${orderItemCount === 1 ? "" : "s"}).`

  const examples =
    orderNumbers.length > 0
      ? ` Examples: ${orderNumbers.map((n) => `#${n}`).join(", ")}${orderCount > orderNumbers.length ? ", …" : ""}.`
      : ""

  return [
    `${historyLine}${examples}`,
    "Deleting will remove it from your catalog. Order history will keep the line item, but the product link will be broken.",
    "We recommend archiving instead — archived products stay hidden from the storefront but preserve full order references.",
  ].join(" ")
}

export function buildBulkProductDeleteDescription(options: {
  totalSelected: number
  withOrdersCount: number
}): string {
  const { totalSelected, withOrdersCount } = options

  if (withOrdersCount === 0) {
    return `Permanently delete ${totalSelected} selected product${totalSelected === 1 ? "" : "s"}?`
  }

  return [
    `${withOrdersCount} of ${totalSelected} selected product${totalSelected === 1 ? "" : "s"} ${withOrdersCount === 1 ? "is" : "are"} linked to order history.`,
    "Deleting will remove them from your catalog. Order line items will remain but product links will break.",
    "Consider archiving products with order history instead.",
  ].join(" ")
}
