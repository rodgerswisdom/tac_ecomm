"use server"

import { CouponType } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/admin/action-result"
import { assertAdmin } from "./auth"
import { logAdminAction } from "./audit"

export async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
}

const couponSchema = z.object({
  code: z.string().min(3).max(32).toUpperCase(),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(CouponType),
  value: z.number().positive(),
  minAmount: z.number().nonnegative().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
})

function parseCouponData(formData: FormData) {
  const rawStartsAt = formData.get("startsAt")?.toString()
  const rawExpiresAt = formData.get("expiresAt")?.toString()

  return {
    code: formData.get("code")?.toString() || "",
    description: formData.get("description")?.toString() || null,
    type: formData.get("type")?.toString() as CouponType,
    value: Number(formData.get("value")?.toString() || 0),
    minAmount: formData.get("minAmount") ? Number(formData.get("minAmount")) : null,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
    startsAt: rawStartsAt ? new Date(rawStartsAt) : null,
    expiresAt: rawExpiresAt ? new Date(rawExpiresAt) : null,
  }
}

export async function createCouponAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = couponSchema.safeParse(parseCouponData(formData))

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon data" }
  }

  try {
    const coupon = await prisma.coupon.create({ data: parsed.data })

    await logAdminAction("CREATE_COUPON", "Coupon", coupon.id, `Created coupon: ${coupon.code}`)

    revalidatePath("/admin/coupons")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/global-store")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create coupon" }
  }
}

export async function updateCouponAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = couponSchema.safeParse(parseCouponData(formData))

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon data" }
  }

  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: parsed.data,
    })

    await logAdminAction("UPDATE_COUPON", "Coupon", id, `Updated coupon: ${coupon.code}`)

    revalidatePath("/admin/coupons")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/global-store")
    revalidatePath(`/admin/coupons/${id}/edit`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update coupon" }
  }
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  try {
    const coupon = await prisma.coupon.delete({ where: { id } })

    await logAdminAction("DELETE_COUPON", "Coupon", id, `Deleted coupon: ${coupon.code}`)

    revalidatePath("/admin/coupons")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/global-store")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete coupon" }
  }
}
