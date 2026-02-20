"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"

export async function getAdminSettingsData() {
    const [featuredProducts, bespokeProducts, corporateGiftProducts, coupons] = await Promise.all([
        prisma.product.findMany({ where: { isFeatured: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
        prisma.product.findMany({ where: { isBespoke: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
        prisma.product.findMany({ where: { isCorporateGift: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
        prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    ])

    return { featuredProducts, bespokeProducts, corporateGiftProducts, coupons }
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
