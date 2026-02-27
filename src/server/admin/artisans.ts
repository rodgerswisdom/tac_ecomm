"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import { logAdminAction } from "./audit"
import { ActionResult } from "./users"

const artisanSchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(2, "Name is required"),
    region: z.string().min(2, "Region is required"),
    regionLabel: z.string().min(2, "Region label is required"),
    craft: z.string().min(2, "Craft is required"),
    quote: z.string().min(10, "Quote is required"),
    portrait: z.string().url("Portrait URL is required"),
    video: z.string().url().optional().nullable().or(z.literal("")),
    bio: z.string().min(20, "Bio is required"),
    community: z.string().optional().nullable(),
})

export async function createArtisanAction(
    _prev: ActionResult | undefined,
    formData: FormData
): Promise<ActionResult> {
    await assertAdmin()

    const parsed = artisanSchema.safeParse({
        name: formData.get("name"),
        region: formData.get("region"),
        regionLabel: formData.get("regionLabel"),
        craft: formData.get("craft"),
        quote: formData.get("quote"),
        portrait: formData.get("portrait"),
        video: formData.get("video"),
        bio: formData.get("bio"),
        community: formData.get("community"),
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid artisan data" }
    }

    try {
        const artisan = await prisma.artisan.create({
            data: {
                ...parsed.data,
                video: parsed.data.video || null,
            },
        })

        await logAdminAction("CREATE_ARTISAN", "Artisan", artisan.id, `Created artisan: ${artisan.name}`)

        revalidatePath("/admin/artisans")
        return { success: true }
    } catch (error) {
        console.error("Failed to create artisan:", error)
        return { error: "Failed to create artisan" }
    }
}

export async function updateArtisanAction(
    _prev: ActionResult | undefined,
    formData: FormData
): Promise<ActionResult> {
    await assertAdmin()

    const id = formData.get("id")?.toString()
    if (!id) return { error: "Artisan ID is required" }

    const parsed = artisanSchema.safeParse({
        name: formData.get("name"),
        region: formData.get("region"),
        regionLabel: formData.get("regionLabel"),
        craft: formData.get("craft"),
        quote: formData.get("quote"),
        portrait: formData.get("portrait"),
        video: formData.get("video"),
        bio: formData.get("bio"),
        community: formData.get("community"),
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid artisan data" }
    }

    try {
        const artisan = await prisma.artisan.update({
            where: { id },
            data: {
                ...parsed.data,
                video: parsed.data.video || null,
            },
        })

        await logAdminAction("UPDATE_ARTISAN", "Artisan", artisan.id, `Updated artisan: ${artisan.name}`)

        revalidatePath("/admin/artisans")
        revalidatePath(`/admin/artisans/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update artisan:", error)
        return { error: "Failed to update artisan" }
    }
}

export async function deleteArtisanAction(formData: FormData) {
    await assertAdmin()

    const id = formData.get("id")?.toString()
    if (!id) throw new Error("Artisan ID is required")

    try {
        const artisan = await prisma.artisan.delete({
            where: { id },
        })

        await logAdminAction("DELETE_ARTISAN", "Artisan", id, `Deleted artisan: ${artisan.name}`)

        revalidatePath("/admin/artisans")
    } catch (error) {
        console.error("Failed to delete artisan:", error)
        throw new Error("Failed to delete artisan. Ensure no products are linked.")
    }
}

export async function getArtisans() {
    return prisma.artisan.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { products: true } },
        },
    })
}

export async function getArtisanById(id: string) {
    return prisma.artisan.findUnique({
        where: { id },
    })
}
