import { NextRequest, NextResponse } from 'next/server'
import { PaymentStatus } from '@prisma/client'
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
    // The webhook will still settle the order; show the pending state meanwhile.
    console.error('[paystack/callback] verification failed:', error)
    thankYou.searchParams.set('orderNumber', reference)
    thankYou.searchParams.set('status', 'pending')
  }

  return NextResponse.redirect(thankYou)
}
