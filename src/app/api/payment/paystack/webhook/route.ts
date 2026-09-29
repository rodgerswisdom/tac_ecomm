import { NextRequest, NextResponse } from 'next/server'
import { confirmPaystackPayment, isValidWebhookSignature } from '@/lib/paystack'

type PaystackWebhookEvent = {
  event?: string
  data?: { reference?: string }
}

const HANDLED_EVENTS = new Set(['charge.success', 'charge.failed', 'refund.processed'])

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

  const reference = event.data?.reference?.trim()
  if (!event.event || !HANDLED_EVENTS.has(event.event) || !reference) {
    return NextResponse.json({ received: true })
  }

  try {
    // Re-verify with the API rather than trusting the payload's status/amount.
    await confirmPaystackPayment(reference)
  } catch (error) {
    console.error('[paystack/webhook] processing failed:', { event: event.event, reference, error })
    // Non-2xx makes Paystack retry later.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
