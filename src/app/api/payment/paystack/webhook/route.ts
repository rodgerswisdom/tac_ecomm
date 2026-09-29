import { NextRequest, NextResponse } from 'next/server'
import { confirmPaystackPayment, isValidWebhookSignature, syncPaystackRefunds } from '@/lib/paystack'

type PaystackWebhookEvent = {
  event?: string
  data?: {
    reference?: string
    // Refund events identify the charge this way rather than with `reference`.
    transaction_reference?: string
    transaction?: { reference?: string } | number
  }
}

const CHARGE_EVENTS = new Set(['charge.success'])
const REFUND_EVENTS = new Set(['refund.processed'])

function chargeReference(event: PaystackWebhookEvent): string | undefined {
  const data = event.data
  if (!data) return undefined
  const fromTransaction = typeof data.transaction === 'object' ? data.transaction?.reference : undefined
  return (data.transaction_reference ?? fromTransaction ?? data.reference)?.trim() || undefined
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!isValidWebhookSignature(rawBody, req.headers.get('x-paystack-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: PaystackWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = event.event ?? ''
  const isCharge = CHARGE_EVENTS.has(name)
  const isRefund = REFUND_EVENTS.has(name)
  const reference = isCharge ? event.data?.reference?.trim() : isRefund ? chargeReference(event) : undefined
  if (!reference) {
    return NextResponse.json({ received: true })
  }

  try {
    // Both re-read state from Paystack's API rather than trusting the payload.
    if (isCharge) await confirmPaystackPayment(reference)
    else await syncPaystackRefunds(reference)
  } catch (error) {
    console.error('[paystack/webhook] processing failed:', { event: name, reference, error })
    // Non-2xx makes Paystack retry later.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
