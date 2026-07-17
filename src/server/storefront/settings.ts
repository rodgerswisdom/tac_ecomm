import { prisma } from "@/lib/prisma"
import type { OfferOfTheMonth } from "@/types/offer"

export type { OfferOfTheMonth }

export async function getOfferOfTheMonth(): Promise<OfferOfTheMonth | null> {
  const settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
    select: {
      offerIsActive: true,
      offerTitle: true,
      offerHeadline: true,
      offerDescription: true,
      offerImage: true,
      offerCtaLabel: true,
      offerCtaHref: true,
    },
  })

  if (!settings?.offerIsActive) {
    return null
  }

  const title = settings.offerTitle?.trim()
  const headline = settings.offerHeadline?.trim()
  const description = settings.offerDescription?.trim()
  const image = settings.offerImage?.trim()
  const ctaLabel = settings.offerCtaLabel?.trim()
  const ctaHref = settings.offerCtaHref?.trim()

  if (!title || !headline || !description || !image || !ctaLabel || !ctaHref) {
    return null
  }

  return {
    title,
    headline,
    description,
    image,
    ctaLabel,
    ctaHref,
  }
}
