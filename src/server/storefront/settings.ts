import { prisma } from "@/lib/prisma"
import { getDiscountPercent, hasValidDiscount } from "@/lib/discount"
import type { OfferOfTheMonth } from "@/types/offer"

export type { OfferOfTheMonth }

export async function getOfferOfTheMonth(): Promise<OfferOfTheMonth | null> {
  const settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
    select: {
      offerIsActive: true,
      offerProductId: true,
    },
  })

  if (!settings?.offerIsActive || !settings.offerProductId) {
    return null
  }

  const product = await prisma.product.findFirst({
    where: {
      id: settings.offerProductId,
      isArchived: false,
      isActive: true,
      isDraft: false,
    },
    select: {
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      comparePrice: true,
      images: {
        take: 1,
        orderBy: { order: "asc" },
        select: { url: true },
      },
    },
  })

  const image = product?.images[0]?.url?.trim()
  if (!product || !image) {
    return null
  }

  const description =
    product.shortDescription?.trim() ||
    product.description.trim() ||
    "A curated highlight from this month's atelier selection."

  const isDiscounted = hasValidDiscount(product.price, product.comparePrice)
  const originalPrice = isDiscounted ? product.comparePrice! : null
  const discountPercent = isDiscounted
    ? getDiscountPercent(product.price, product.comparePrice)
    : null

  return {
    title: "Offer of the Month",
    headline: product.name,
    description,
    image,
    ctaLabel: "Shop Now",
    ctaHref: `/products/${product.slug}`,
    price: product.price,
    originalPrice,
    discountPercent,
  }
}
