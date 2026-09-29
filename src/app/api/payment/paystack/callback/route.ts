import { NextRequest, NextResponse } from 'next/server'
import { PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { confirmPaystackPayment } from '@/lib/paystack'

function statusParam(paymentStatus: PaymentStatus | null): string {
  switch (paymentStatus) {
    case PaymentStatus.COMPLETED:
      return 'success'
    case PaymentStatus.FAILED:
      return 'failed'
    case PaymentStatus.CANCELLED:
      return 'cancelled'
    default:
      return 'pending'
  }
}

/** Paystack redirects the customer here after checkout with ?reference=<orderNumber>. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const reference = (params.get('reference') || params.get('trxref') || '').trim()
  const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin
  const thankYou = new URL('/checkout/thank-you', baseUrl)

  if (!reference) {
    thankYou.searchParams.set('status', 'failed')
    return NextResponse.redirect(thankYou)
  }

  try {
    const result = await confirmPaystackPayment(reference)
    if (result.orderId) thankYou.searchParams.set('orderId', result.orderId)
    thankYou.searchParams.set('status', statusParam(result.paymentStatus))
  } catch (error) {
    // Show the pending page with the real order id so it keeps re-checking with
    // Paystack (see reconcilePaystackOrder) instead of getting stuck.
    console.error('[paystack/callback] verification failed:', { reference, error })
    const order = await prisma.order
      .findUnique({ where: { orderNumber: reference }, select: { id: true } })
      .catch(() => null)
    if (order) thankYou.searchParams.set('orderId', order.id)
    thankYou.searchParams.set('orderNumber', reference)
    thankYou.searchParams.set('status', 'pending')
  }

  return NextResponse.redirect(thankYou)
}
