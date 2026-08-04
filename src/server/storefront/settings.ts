import { prisma } from "@/lib/prisma"
import { getDiscountPercent, hasValidDiscount } from "@/lib/discount"
import type { OfferOfTheMonth } from "@/types/offer"

export type { OfferOfTheMonth }

export type HeroContent = {
  image: string
  tagline: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
}

const DEFAULT_HERO: HeroContent = {
  image:
    "https://plus.unsplash.com/premium_photo-1666789257989-f2a5e8a2b972?auto=format&fit=crop&q=60&w=900",
  tagline: "Heritage Atelier Spotlight",
  headline: "Crafted by Heritage, Worn with Pride",
  description:
    "From the soil of Africa to the hands of its artisans, our jewellery is a symphony of earth and soul. Every design is a poetic expression of culture, artistry, and authenticity. These treasures are more than adornments — they are the heartbeat of Africa, worn close to yours.",
  ctaLabel: "Shop Collections",
  ctaHref: "/collections",
}

export async function getHeroContent(): Promise<HeroContent> {
  const settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
    select: {
      heroImage: true,
      heroHeadline: true,
      heroTagline: true,
    },
  })

  return {
    image: settings?.heroImage?.trim() || DEFAULT_HERO.image,
    tagline: settings?.heroTagline?.trim() || DEFAULT_HERO.tagline,
    headline: settings?.heroHeadline?.trim() || DEFAULT_HERO.headline,
    description: DEFAULT_HERO.description,
    ctaLabel: DEFAULT_HERO.ctaLabel,
    ctaHref: DEFAULT_HERO.ctaHref,
  }
}

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
