import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, message: 'No coupon code provided.' }, { status: 400 })
  }
  const codeTrim = String(code).trim()
  if (!codeTrim) {
    return NextResponse.json({ valid: false, message: 'No coupon code provided.' }, { status: 400 })
  }

  // Case-insensitive lookup (Prisma findFirst with mode: 'insensitive')
  const coupon = await prisma.coupon.findFirst({
    where: { code: { equals: codeTrim, mode: 'insensitive' } }
  })
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, message: 'Invalid or inactive coupon.' }, { status: 404 })
  }
  const now = new Date()
  if (coupon.startsAt && now < coupon.startsAt) {
    return NextResponse.json({ valid: false, message: 'This coupon is not yet valid.' }, { status: 400 })
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return NextResponse.json({ valid: false, message: 'This coupon has expired.' }, { status: 400 })
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: 'Coupon usage limit reached.' }, { status: 400 })
  }
  const subtotalNum = Number(subtotal)
  if (coupon.minAmount != null && (Number.isNaN(subtotalNum) || subtotalNum < coupon.minAmount)) {
    return NextResponse.json({
      valid: false,
      message: `Minimum order amount for this coupon is $${coupon.minAmount.toFixed(2)}`
    }, { status: 400 })
  }
  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = subtotalNum * (coupon.value / 100)
  } else if (coupon.type === 'FIXED_AMOUNT') {
    discount = Math.min(coupon.value, subtotalNum)
  }
  // FREE_SHIPPING: discount 0 (shipping handled elsewhere when we add real shipping)
  discount = Math.max(0, Math.min(discount, subtotalNum))
  return NextResponse.json({
    valid: true,
    message: 'Coupon applied!',
    code: coupon.code,
    discount,
    type: coupon.type,
    value: coupon.value
  })
}
