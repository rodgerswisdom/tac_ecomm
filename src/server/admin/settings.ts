"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import { logAdminAction } from "./audit"

export async function getAdminSettingsData() {
    const [featuredProducts, bespokeProducts, corporateGiftProducts, coupons, globalSettings, auditLogs] = await Promise.all([
        prisma.product.findMany({ where: { isFeatured: true }, orderBy: { updatedAt: "desc" }, take: 10, include: { images: { take: 1 } } }),
        prisma.product.findMany({ where: { isBespoke: true }, orderBy: { updatedAt: "desc" }, take: 10, include: { images: { take: 1 } } }),
        prisma.product.findMany({ where: { isCorporateGift: true }, orderBy: { updatedAt: "desc" }, take: 10, include: { images: { take: 1 } } }),
        prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
        (prisma as any).settings.upsert({
            where: { id: "singleton" },
            update: {},
            create: { id: "singleton" },
        }),
        prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20
        })
    ])

    return { featuredProducts, bespokeProducts, corporateGiftProducts, coupons, globalSettings, auditLogs }
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
    defaultCurrency: z.string().length(3),
    usdToKesRate: z.coerce.number().positive(),
    usdToEurRate: z.coerce.number().positive(),
    taxRate: z.coerce.number().min(0),
    baseShippingFee: z.coerce.number().min(0),
    smsSenderId: z.string().max(30),
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
        const currentSettings = await (prisma as any).settings.findUnique({
            where: { id: "singleton" }
        })

        await (prisma as any).settings.update({
            where: { id: "singleton" },
            data: parsed.data,
        })
        
        // Detailed change tracking
        const changedFields: string[] = []
        if (currentSettings) {
            Object.keys(parsed.data).forEach(key => {
                const oldValue = currentSettings[key]
                const newValue = (parsed.data as any)[key]
                
                // Compare values (handling basic types and dates)
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
    
    await logAdminAction(
        "TOGGLE_PRODUCT_FLAG",
        "Product",
        parsed.data.productId,
        `Toggled ${parsed.data.field} to ${parsed.data.value}`
    )

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
    
    await logAdminAction(
        "TOGGLE_COUPON",
        "Coupon",
        parsed.data.couponId,
        `Toggled coupon active status to ${parsed.data.isActive}`
    )

    revalidatePath("/admin/settings")
}
