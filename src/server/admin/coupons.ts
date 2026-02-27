"use server"

import { CouponType } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
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

export async function createCouponAction(formData: FormData) {
  await assertAdmin()

  const parsed = couponSchema.safeParse(parseCouponData(formData))

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid coupon data")
  }

  const coupon = await prisma.coupon.create({ data: parsed.data })

  await logAdminAction("CREATE_COUPON", "Coupon", coupon.id, `Created coupon: ${coupon.code}`)

  revalidatePath("/admin/coupons")
  revalidatePath("/admin/settings")
}

export async function updateCouponAction(id: string, formData: FormData) {
  await assertAdmin()

  const parsed = couponSchema.safeParse(parseCouponData(formData))

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid coupon data")
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: parsed.data
  })

  await logAdminAction("UPDATE_COUPON", "Coupon", id, `Updated coupon: ${coupon.code}`)

  revalidatePath("/admin/coupons")
  revalidatePath("/admin/settings")
  revalidatePath(`/admin/coupons/${id}/edit`)
}

export async function deleteCouponAction(id: string) {
  await assertAdmin()

  const coupon = await prisma.coupon.delete({ where: { id } })

  await logAdminAction("DELETE_COUPON", "Coupon", id, `Deleted coupon: ${coupon.code}`)

  revalidatePath("/admin/coupons")
  revalidatePath("/admin/settings")
}
