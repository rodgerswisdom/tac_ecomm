import { CouponType } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"

export async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
}

const couponSchema = z.object({
  code: z.string().min(3).max(32),
  description: z.string().optional(),
  type: z.nativeEnum(CouponType),
  value: z.number().positive(),
  minAmount: z.number().optional(),
  maxUses: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
})

export async function createCouponAction(formData: FormData) {
  "use server"
  await assertAdmin()
  const parsed = couponSchema.safeParse({
    code: formData.get("code")?.toString(),
    description: formData.get("description")?.toString() || undefined,
    type: formData.get("type")?.toString() as CouponType,
    value: Number(formData.get("value")?.toString()),
    minAmount: formData.get("minAmount") ? Number(formData.get("minAmount")?.toString()) : undefined,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")?.toString()) : undefined,
    isActive: formData.get("isActive") === "true",
    startsAt: formData.get("startsAt") ? new Date(formData.get("startsAt")!.toString()) : undefined,
    expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt")!.toString()) : undefined,
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid coupon data")
  }
  await prisma.coupon.create({ data: parsed.data })
}

export async function updateCouponAction(id: string, formData: FormData) {
  "use server"
  await assertAdmin()
  const parsed = couponSchema.safeParse({
    code: formData.get("code")?.toString(),
    description: formData.get("description")?.toString() || undefined,
    type: formData.get("type")?.toString() as CouponType,
    value: Number(formData.get("value")?.toString()),
    minAmount: formData.get("minAmount") ? Number(formData.get("minAmount")?.toString()) : undefined,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")?.toString()) : undefined,
    isActive: formData.get("isActive") === "true",
    startsAt: formData.get("startsAt") ? new Date(formData.get("startsAt")!.toString()) : undefined,
    expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt")!.toString()) : undefined,
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid coupon data")
  }
  await prisma.coupon.update({ where: { id }, data: parsed.data })
}

export async function deleteCouponAction(id: string) {
  "use server"
  await assertAdmin()
  await prisma.coupon.delete({ where: { id } })
}
