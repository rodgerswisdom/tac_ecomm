import {
  getOrderItemImageLabel,
  getOrderItemImageUrl,
  type OrderItemImageSource,
} from "@/lib/product-image-selection"

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

/**
 * The product's current code (what's on the stock label), falling back to the code saved on
 * the order when the product has since been deleted.
 */
export function getOrderItemProductSku(item: OrderItemProductSource): string {
  return item.product?.sku ?? item.productSku ?? "—"
}

/** Order lines for emails: name, code, chosen design and an absolute photo URL. */
export function toOrderEmailItems(
  items: Array<OrderItemProductSource & OrderItemImageSource & { selectedImageLabel?: string | null; quantity: number; price: number }>,
  baseUrl: string,
) {
  return items.map((item) => {
    const image = getOrderItemImageUrl(item)
    const sku = getOrderItemProductSku(item)
    return {
      name: getOrderItemProductName(item),
      quantity: item.quantity,
      price: item.price,
      sku: sku === "—" ? null : sku,
      design: getOrderItemImageLabel(item),
      imageUrl: image?.startsWith("/") ? `${baseUrl.replace(/\/$/, "")}${image}` : image,
    }
  })
}

/** Where links and images in emails point. */
export function getEmailBaseUrl(): string {
  return process.env.APP_URL || process.env.NEXTAUTH_URL || "https://www.tacaccessories.co.ke"
}

export function isOrderItemProductDeleted(item: OrderItemProductSource): boolean {
  return !item.product && Boolean(item.productName)
}
