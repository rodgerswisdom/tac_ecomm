import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createCouponAction, deleteCouponAction } from "@/server/admin/coupons"
import { assertAdmin } from "@/server/admin/auth"

export async function POST(req: NextRequest) {
  try {
    await assertAdmin()

    const contentType = req.headers.get("content-type") || ""
    let formData: FormData
    if (contentType.includes("application/json")) {
      // If sent as JSON, convert to FormData
      const body = await req.json()
      // Adjust expiresAt to end of day if present
      if (body.expiresAt) {
        const d = new Date(body.expiresAt)
        d.setHours(23, 59, 59, 999)
        body.expiresAt = d.toISOString()
      }
      formData = new FormData()
      for (const key in body) {
        if (body[key] !== undefined && body[key] !== null) {
          formData.append(key, body[key])
        }
      }
    } else {
      formData = await req.formData()
      // Adjust expiresAt to end of day if present
      const expiresAt = formData.get("expiresAt")
      if (expiresAt) {
        const d = new Date(expiresAt.toString())
        d.setHours(23, 59, 59, 999)
        formData.set("expiresAt", d.toISOString())
      }
    }
    await createCouponAction(formData)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create coupon" }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await assertAdmin()

    const { couponId, isActive, startsAt, expiresAt } = await req.json()
    if (!couponId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Missing couponId or isActive" }, { status: 400 })
    }
    const updateData: Record<string, unknown> = { isActive }
    if (typeof startsAt === "string" && startsAt) updateData.startsAt = new Date(startsAt)
    if (typeof expiresAt === "string" && expiresAt) {
      const d = new Date(expiresAt)
      d.setHours(23, 59, 59, 999)
      updateData.expiresAt = d
    }
    await prisma.coupon.update({ where: { id: couponId }, data: updateData })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update coupon" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await assertAdmin()

    const { searchParams } = new URL(req.url)
    // Filtering
    const q = searchParams.get("q")?.trim() || ""
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""
    const start = searchParams.get("start") || ""
    const end = searchParams.get("end") || ""
    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10)
    // Sorting
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { type: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    }
    if (status === "active") where.isActive = true
    if (status === "inactive") where.isActive = false
    if (type) where.type = type
    if (start) where.startsAt = { gte: new Date(start) }
    if (end) where.expiresAt = { lte: new Date(end) }

    const [total, coupons] = await Promise.all([
      prisma.coupon.count({ where }),
      prisma.coupon.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    // Analytics: usage summary
    const usageStats = await prisma.coupon.aggregate({
      _sum: { usedCount: true },
      _count: { id: true },
    })
    return NextResponse.json({ coupons, total, usageStats })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await assertAdmin()

    const { couponId } = await req.json()
    if (!couponId) return NextResponse.json({ error: "Missing couponId" }, { status: 400 })
    await deleteCouponAction(couponId)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete coupon" }, { status: 500 })
  }
}
