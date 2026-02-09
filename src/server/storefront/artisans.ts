import { prisma } from "@/lib/prisma"
import type { ArtisanProfile } from "@/types/artisan"

const FALLBACK_VIDEO = "/videos/artisans/default.webm"

export async function getArtisanSpotlight(): Promise<ArtisanProfile[]> {
  const artisans = await prisma.artisan.findMany({
    orderBy: { createdAt: "desc" },
  })

  if (!artisans.length) {
    return []
  }

  return artisans.map((artisan) => ({
    id: artisan.id,
    name: artisan.name,
    region: artisan.region,
    regionLabel: artisan.regionLabel,
    craft: artisan.craft,
    quote: artisan.quote,
    portrait: artisan.portrait,
    video: artisan.video ?? FALLBACK_VIDEO,
  }))
}
