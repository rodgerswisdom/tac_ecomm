import { NextRequest, NextResponse } from 'next/server'
import { checkCheckoutRateLimit, passesCsrfProtection } from '@/lib/request-security'
import { normalizeMpesaCode } from '@/lib/manual-payment'
import { submitManualPaymentCode } from '@/lib/manual-payment-server'

/** Customer submits the M-Pesa confirmation code for a Paybill order ("I've paid"). */
export async function POST(req: NextRequest) {
  if (!passesCsrfProtection(req)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order.' }, { status: 400 })
  }
  const rateLimit = checkCheckoutRateLimit(req, `manual-payment:${orderId}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }
  const code = normalizeMpesaCode(body.code)
  if (!code) {
    return NextResponse.json(
      { error: 'Enter the 10-character code from your M-Pesa message, e.g. SGH4K2ABCD.' },
      { status: 400 }
    )
  }

  try {
    const result = await submitManualPaymentCode(orderId, code)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[manual-payment] submit failed', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
