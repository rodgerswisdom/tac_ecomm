import { prisma } from "@/lib/prisma"

export async function getArtisanOptions() {
    return prisma.artisan.findMany({
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            region: true,
        },
    })
}
