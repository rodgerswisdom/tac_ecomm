"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"

export async function getAdminSettingsData() {
    const [featuredProducts, bespokeProducts, corporateGiftProducts, coupons, globalSettings] = await Promise.all([
        prisma.product.findMany({ where: { isFeatured: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
        prisma.product.findMany({ where: { isBespoke: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
        prisma.product.findMany({ where: { isCorporateGift: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
        prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
        (prisma as any).settings.upsert({
            where: { id: "singleton" },
            update: {},
            create: { id: "singleton" },
        }),
    ])

    return { featuredProducts, bespokeProducts, corporateGiftProducts, coupons, globalSettings }
}

const settingsSchema = z.object({
    storeName: z.string().min(2),
    storeTagline: z.string().optional(),
    supportEmail: z.string().email(),
    salesEmail: z.string().email(),
    whatsappNumber: z.string(),
    address: z.string(),
    instagramUrl: z.string().url().optional().or(z.literal("")),
    facebookUrl: z.string().url().optional().or(z.literal("")),
    maintenanceMode: z.coerce.boolean(),
    autoSyncRates: z.coerce.boolean(),
    defaultCurrency: z.string().length(3),
    usdToKesRate: z.coerce.number().positive(),
    usdToEurRate: z.coerce.number().positive(),
    taxRate: z.coerce.number().min(0),
    baseShippingFee: z.coerce.number().min(0),
    smsSenderId: z.string().max(11),
    emailFromName: z.string().min(2),
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

    const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!parsed.success) {
        return {
            status: "error",
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }

    try {
        await (prisma as any).settings.update({
            where: { id: "singleton" },
            data: parsed.data,
        })

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

export async function toggleProductFlagAction(formData: FormData) {
    await assertAdmin()

    const parsed = productFlagSchema.safeParse({
        productId: formData.get("productId")?.toString(),
        field: formData.get("field")?.toString(),
        value: formData.get("value")?.toString(),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid toggle request")
    }

    await prisma.product.update({
        where: { id: parsed.data.productId },
        data: { [parsed.data.field]: parsed.data.value },
    })

    revalidatePath("/admin/settings")
    revalidatePath("/admin/products")
}

const couponToggleSchema = z.object({
    couponId: z.string().cuid(),
    isActive: z.coerce.boolean(),
})

export async function toggleCouponAction(formData: FormData) {
    await assertAdmin()

    const parsed = couponToggleSchema.safeParse({
        couponId: formData.get("couponId")?.toString(),
        isActive: formData.get("isActive")?.toString(),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid coupon update")
    }

    await prisma.coupon.update({
        where: { id: parsed.data.couponId },
        data: { isActive: parsed.data.isActive },
    })

    revalidatePath("/admin/settings")
}
