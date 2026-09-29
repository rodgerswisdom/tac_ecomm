import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkCheckoutRateLimit, passesCsrfProtection } from '@/lib/request-security'
import {
  PAYMENT_WINDOW_MS,
  paystackReviewReason,
  reconcilePaystackOrder,
  startPaystackPayment,
} from '@/lib/paystack'

/**
 * Retry or resume payment for an existing unpaid order. Reuses the order (no duplicates)
 * and opens a new Paystack transaction with the next attempt's reference.
 */
export async function POST(req: NextRequest) {
  if (!passesCsrfProtection(req)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order.' }, { status: 400 })
  }

  const rateLimit = checkCheckoutRateLimit(req, `retry:${orderId}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many payment attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const baseUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin).replace(/\/$/, '')
  const thankYouUrl = (status: string) =>
    `${baseUrl}/checkout/thank-you?orderId=${encodeURIComponent(orderId)}&status=${status}`

  // The previous attempt may have gone through after all — never charge twice.
  await reconcilePaystackOrder({ id: orderId }, { force: true })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      paymentAttempt: true,
      user: { select: { email: true } },
      payments: { select: { method: true, gatewayResponse: true } },
      items: {
        select: {
          quantity: true,
          productName: true,
          product: { select: { stock: true, isActive: true } },
          variantId: true,
        },
      },
    },
  })

  if (!order || order.paymentMethod !== PaymentMethod.PAYSTACK) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }
  if (order.paymentStatus === PaymentStatus.COMPLETED) {
    return NextResponse.json({ success: true, redirectUrl: thankYouUrl('success') })
  }
  if (paystackReviewReason(order.payments)) {
    return NextResponse.json(
      { error: 'We are already verifying a payment for this order. Please contact us before paying again.' },
      { status: 409 }
    )
  }
  if (order.status === OrderStatus.EXPIRED) {
    return NextResponse.json(
      { error: 'This order has expired. Please check out again.', expired: true },
      { status: 410 }
    )
  }
  if (order.status !== OrderStatus.PENDING) {
    return NextResponse.json({ error: 'This order can no longer be paid.' }, { status: 409 })
  }

  // Stock is only taken on payment, so re-check it before asking for money again.
  const variantIds = order.items.map((item) => item.variantId).filter((id): id is string => Boolean(id))
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } }, select: { id: true, stock: true } })
    : []
  const unavailable = order.items.filter((item) => {
    if (!item.product?.isActive) return true
    const stock = item.variantId
      ? variants.find((variant) => variant.id === item.variantId)?.stock ?? 0
      : item.product.stock
    return stock < item.quantity
  })
  if (unavailable.length > 0) {
    return NextResponse.json(
      {
        error: `Sorry, ${unavailable.map((item) => item.productName ?? 'an item').join(', ')} is no longer available in that quantity.`,
      },
      { status: 409 }
    )
  }

  // Claim the next attempt number atomically so two clicks can't share a reference.
  const attempt = order.paymentAttempt + 1
  const claimed = await prisma.order.updateMany({
    where: { id: order.id, paymentAttempt: order.paymentAttempt, status: OrderStatus.PENDING },
    data: {
      paymentAttempt: attempt,
      paymentStatus: PaymentStatus.PENDING,
      paymentExpiresAt: new Date(Date.now() + PAYMENT_WINDOW_MS),
    },
  })
  if (claimed.count === 0) {
    return NextResponse.json({ error: 'A payment is already starting. Please wait a moment.' }, { status: 409 })
  }

  try {
    const redirectUrl = await startPaystackPayment({
      order,
      email: order.user.email,
      attempt,
      baseUrl,
    })
    return NextResponse.json({ success: true, redirectUrl })
  } catch (error) {
    console.error('[paystack/retry] initialization failed', { orderId, attempt, error })
    return NextResponse.json({ error: 'We could not start the payment. Please try again.' }, { status: 502 })
  }
}
