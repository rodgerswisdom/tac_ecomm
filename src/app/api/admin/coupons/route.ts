export async function PATCH(req: NextRequest) {
  try {
    const { couponId, isActive } = await req.json();
    if (!couponId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Missing couponId or isActive" }, { status: 400 });
    }
    await prisma.coupon.update({ where: { id: couponId }, data: { isActive } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCouponAction } from "@/server/admin/coupons";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Filtering
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";
    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    // Sorting
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const where: any = {};
    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { type: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;
    if (type) where.type = type;
    if (start) where.startsAt = { gte: new Date(start) };
    if (end) where.expiresAt = { lte: new Date(end) };

    const [total, coupons] = await Promise.all([
      prisma.coupon.count({ where }),
      prisma.coupon.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    // Analytics: usage summary
    const usageStats = await prisma.coupon.aggregate({
      _sum: { usedCount: true },
      _count: { id: true },
    });
    return NextResponse.json({ coupons, total, usageStats });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { couponId } = await req.json();
    if (!couponId) return NextResponse.json({ error: "Missing couponId" }, { status: 400 });
    await deleteCouponAction(couponId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
