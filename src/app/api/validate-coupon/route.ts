import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, message: 'No coupon code provided.' }, { status: 400 })
  }
  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, message: 'Invalid or inactive coupon.' }, { status: 404 })
  }
  const now = new Date()
  if ((coupon.startsAt && now < coupon.startsAt) || (coupon.expiresAt && now > coupon.expiresAt)) {
    return NextResponse.json({ valid: false, message: 'Coupon is expired or not yet valid.' }, { status: 400 })
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: 'Coupon usage limit reached.' }, { status: 400 })
  }
  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return NextResponse.json({ valid: false, message: `Minimum order amount for this coupon is $${coupon.minAmount}` }, { status: 400 })
  }
  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = subtotal * (coupon.value / 100)
  } else if (coupon.type === 'FIXED_AMOUNT') {
    discount = coupon.value
  } else if (coupon.type === 'FREE_SHIPPING') {
    discount = 0 // handled in shipping logic
  }
  return NextResponse.json({ valid: true, message: 'Coupon applied!', discount, type: coupon.type, value: coupon.value })
}
