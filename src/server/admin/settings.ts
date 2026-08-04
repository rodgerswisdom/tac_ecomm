"use server"

import { revalidatePath } from "next/cache"
import { ProductType } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/admin/action-result"
import { assertAdmin } from "./auth"
import { logAdminAction } from "./audit"

export async function getAdminSettingsData() {
    // Keep concurrency low: Neon free-tier cold starts + a small pg pool
    // choke when too many queries run in parallel.
    const [curatedProducts, globalSettings, auditLogs] = await Promise.all([
        prisma.product.findMany({
            where: {
                OR: [
                    { isFeatured: true },
                    { isBespoke: true },
                    { isCorporateGift: true },
                ],
            },
            orderBy: { updatedAt: "desc" },
            take: 40,
            include: { images: { take: 1 } },
        }),
        prisma.settings.upsert({
            where: { id: "singleton" },
            update: {},
            create: { id: "singleton" },
        }),
        prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
    ])

    const featuredProducts = curatedProducts.filter((p) => p.isFeatured).slice(0, 10)
    const bespokeProducts = curatedProducts.filter((p) => p.isBespoke).slice(0, 10)
    const corporateGiftProducts = curatedProducts.filter((p) => p.isCorporateGift).slice(0, 10)

    let offerProduct: OfferProductOption | null = null
    if (globalSettings.offerProductId) {
        const product = await prisma.product.findUnique({
            where: { id: globalSettings.offerProductId },
            select: {
                id: true,
                name: true,
                sku: true,
                images: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
            },
        })
        if (product) {
            offerProduct = {
                id: product.id,
                name: product.name,
                sku: product.sku,
                image: product.images[0]?.url ?? null,
            }
        }
    }

    return {
        featuredProducts,
        bespokeProducts,
        corporateGiftProducts,
        coupons: [] as Awaited<ReturnType<typeof prisma.coupon.findMany>>,
        globalSettings,
        auditLogs,
        offerProduct,
    }
}

export type OfferProductOption = {
    id: string
    name: string
    sku: string
    image: string | null
}

export async function searchOfferProductsAction(query: string): Promise<OfferProductOption[]> {
    await assertAdmin()

    const trimmed = query.trim()
    if (trimmed.length < 2) {
        return []
    }

    const products = await prisma.product.findMany({
        where: {
            isArchived: false,
            OR: [
                { name: { contains: trimmed, mode: "insensitive" } },
                { sku: { contains: trimmed, mode: "insensitive" } },
            ],
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
            id: true,
            name: true,
            sku: true,
            images: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
        },
    })

    return products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0]?.url ?? null,
    }))
}

const settingsSchema = z.object({
    storeName: z.string().min(2),
    storeTagline: z.string().optional(),
    supportEmail: z.string().email(),
    salesEmail: z.string().email(),
    whatsappNumber: z.string(),
    address: z.string(),
    instagramUrl: z.string().optional().or(z.literal("")),
    facebookUrl: z.string().optional().or(z.literal("")),
    maintenanceMode: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    autoSyncRates: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    defaultCurrency: z.string().length(3).default("KSH"),
    usdToKesRate: z.coerce.number().positive(),
    usdToEurRate: z.coerce.number().positive(),
    taxRate: z.coerce.number().min(0),
    baseShippingFee: z.coerce.number().min(0),
    smsSenderId: z.string().max(30),
    emailFromName: z.string().min(2),
    offerProductId: z.string().optional().or(z.literal("")),
    offerIsActive: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    heroImage: z.string().optional().or(z.literal("")),
    heroHeadline: z.string().max(160).optional().or(z.literal("")),
    heroTagline: z.string().max(120).optional().or(z.literal("")),
})

export type SettingsFormState = {
    status: "idle" | "loading" | "success" | "error"
    message?: string
    errors?: Record<string, string[]>
}

export async function updateGlobalSettingsAction(
    prevState: SettingsFormState,
    formData: FormData
): Promise<SettingsFormState> {
    await assertAdmin()

    const data = Object.fromEntries(formData.entries())
    const parsed = settingsSchema.safeParse(data)

    if (!parsed.success) {
        console.error("Settings Validation Failed:", parsed.error.flatten().fieldErrors)
        return {
            status: "error",
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }

    try {
        const currentSettings = await prisma.settings.findUnique({
            where: { id: "singleton" }
        })

        const offerProductId = parsed.data.offerProductId?.trim() || null

        if (offerProductId) {
            const productExists = await prisma.product.findUnique({
                where: { id: offerProductId },
                select: { id: true },
            })
            if (!productExists) {
                return {
                    status: "error",
                    message: "Selected offer product was not found",
                    errors: { offerProductId: ["Product not found"] },
                }
            }
        }

        if (parsed.data.offerIsActive && !offerProductId) {
            return {
                status: "error",
                message: "Select a product to activate Offer of the Month",
                errors: { offerProductId: ["Select a product"] },
            }
        }

        await prisma.settings.update({
            where: { id: "singleton" },
            data: {
                storeName: parsed.data.storeName,
                storeTagline: parsed.data.storeTagline,
                supportEmail: parsed.data.supportEmail,
                salesEmail: parsed.data.salesEmail,
                whatsappNumber: parsed.data.whatsappNumber,
                address: parsed.data.address,
                instagramUrl: parsed.data.instagramUrl || null,
                facebookUrl: parsed.data.facebookUrl || null,
                maintenanceMode: parsed.data.maintenanceMode,
                autoSyncRates: parsed.data.autoSyncRates,
                defaultCurrency: parsed.data.defaultCurrency,
                usdToKesRate: parsed.data.usdToKesRate,
                usdToEurRate: parsed.data.usdToEurRate,
                taxRate: parsed.data.taxRate,
                baseShippingFee: parsed.data.baseShippingFee,
                smsSenderId: parsed.data.smsSenderId,
                emailFromName: parsed.data.emailFromName,
                offerProductId,
                offerIsActive: parsed.data.offerIsActive,
                heroImage: parsed.data.heroImage?.trim() || null,
                heroHeadline: parsed.data.heroHeadline?.trim() || null,
                heroTagline: parsed.data.heroTagline?.trim() || null,
            },
        })
        
        // Detailed change tracking
        const changedFields: string[] = []
        if (currentSettings) {
            const previous = currentSettings as Record<string, unknown>
            Object.keys(parsed.data).forEach((key) => {
                const oldValue = previous[key]
                const newValue = (parsed.data as Record<string, unknown>)[key]

                if (String(oldValue) !== String(newValue)) {
                    changedFields.push(`${key}: ${oldValue} → ${newValue}`)
                }
            })
        }

        await logAdminAction(
            "UPDATE_SETTINGS",
            "Settings",
            "singleton",
            changedFields.length > 0 
                ? `Updated: ${changedFields.join(", ")}`
                : "Updated store identity and operational configuration."
        )

        revalidatePath("/admin/settings")
        revalidatePath("/")
        return { status: "success", message: "Settings updated successfully" }
    } catch (error) {
        console.error("Settings update error:", error)
        return { status: "error", message: "Failed to update settings" }
    }
}

const productFlagSchema = z.object({
    productId: z.string().cuid(),
    field: z.enum(["isFeatured", "isBespoke", "isCorporateGift", "isActive"]),
    value: z.coerce.boolean(),
})

export async function toggleProductFlagAction(formData: FormData): Promise<ActionResult> {
    try {
        await assertAdmin()
    } catch {
        return { error: "Unauthorized" }
    }

    const parsed = productFlagSchema.safeParse({
        productId: formData.get("productId")?.toString(),
        field: formData.get("field")?.toString(),
        value: formData.get("value")?.toString(),
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid toggle request" }
    }

    try {
        const existing = await prisma.product.findUnique({
            where: { id: parsed.data.productId },
            select: { productType: true },
        })
        if (!existing) {
            return { error: "Product not found" }
        }

        const data: { isFeatured?: boolean; isBespoke?: boolean; isCorporateGift?: boolean; isActive?: boolean; productType?: typeof existing.productType } = {
            [parsed.data.field]: parsed.data.value,
        }

        if (parsed.data.field === "isBespoke") {
            if (parsed.data.value) {
                if (existing.productType === ProductType.READY_TO_WEAR || existing.productType === ProductType.MATCHING_SET) {
                    data.productType = ProductType.BESPOKE
                }
            } else if (existing.productType === ProductType.BESPOKE) {
                data.productType = ProductType.READY_TO_WEAR
            }
        }

        await prisma.product.update({
            where: { id: parsed.data.productId },
            data,
        })

        await logAdminAction(
            "TOGGLE_PRODUCT_FLAG",
            "Product",
            parsed.data.productId,
            `Toggled ${parsed.data.field} to ${parsed.data.value}`,
        )

        revalidatePath("/admin/settings")
        revalidatePath("/admin/products")
        revalidatePath("/admin/bespoke")
        revalidatePath("/bespoke")
        revalidatePath("/collections")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update product flag" }
    }
}

const couponToggleSchema = z.object({
    couponId: z.string().cuid(),
    isActive: z.coerce.boolean(),
})

export async function toggleCouponAction(formData: FormData): Promise<ActionResult> {
    try {
        await assertAdmin()
    } catch {
        return { error: "Unauthorized" }
    }

    const parsed = couponToggleSchema.safeParse({
        couponId: formData.get("couponId")?.toString(),
        isActive: formData.get("isActive")?.toString(),
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid coupon update" }
    }

    try {
        await prisma.coupon.update({
            where: { id: parsed.data.couponId },
            data: { isActive: parsed.data.isActive },
        })

        await logAdminAction(
            "TOGGLE_COUPON",
            "Coupon",
            parsed.data.couponId,
            `Toggled coupon active status to ${parsed.data.isActive}`,
        )

        revalidatePath("/admin/settings")
        revalidatePath("/admin/coupons")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update coupon" }
    }
}
