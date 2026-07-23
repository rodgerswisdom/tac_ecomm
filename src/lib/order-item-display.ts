type OrderItemProductSource = {
  productName?: string | null
  productSku?: string | null
  product?: {
    name?: string | null
    sku?: string | null
    slug?: string | null
  } | null
}

export function getOrderItemProductName(item: OrderItemProductSource): string {
  return item.productName ?? item.product?.name ?? "Deleted product"
}

export function getOrderItemProductSku(item: OrderItemProductSource): string {
  return item.productSku ?? item.product?.sku ?? "—"
}

export function isOrderItemProductDeleted(item: OrderItemProductSource): boolean {
  return !item.product && Boolean(item.productName)
}
