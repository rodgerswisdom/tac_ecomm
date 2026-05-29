import { NextRequest, NextResponse } from 'next/server'
import { PaymentMethod } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { applyPaymentUpdate, type GatewayPaymentStatus } from '@/lib/order-payment-update'

type TumaCallbackPayload = {
  status?: string
  merchant_request_id?: string
  checkout_request_id?: string
  result_code?: number
  result_desc?: string
  failure_reason?: string
  mpesa_receipt_number?: string
  amount?: number
  timestamp?: string
}

export async function POST(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get('orderId')?.trim()
  let body: TumaCallbackPayload = {}

  try {
    body = (await req.json()) as TumaCallbackPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const checkoutRequestId = body.checkout_request_id?.trim()
  const merchantRequestId = body.merchant_request_id?.trim()

  if (!orderId && !checkoutRequestId && !merchantRequestId) {
    return NextResponse.json({ error: 'Missing order or transaction identifiers' }, { status: 400 })
  }

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true }
      })
    : await prisma.order.findFirst({
        where: {
          payments: {
            some: {
              method: { in: [PaymentMethod.TUMA, PaymentMethod.PESAPAL] },
              OR: [
                ...(checkoutRequestId ? [{ transactionId: checkoutRequestId }] : []),
                ...(merchantRequestId
                  ? [{ gatewayResponse: { contains: merchantRequestId } }]
                  : [])
              ]
            }
          }
        },
        select: { id: true }
      })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const gatewayStatus = mapTumaStatus(body)
  const transactionId = checkoutRequestId || merchantRequestId || 'unknown'

  try {
    await applyPaymentUpdate({
      orderId: order.id,
      method: PaymentMethod.TUMA,
      gatewayStatus,
      transactionId,
      amount: typeof body.amount === 'number' ? body.amount : undefined,
      currency: 'KES',
      gatewayResponse: body
    })
  } catch (error) {
    console.error('Tuma callback processing failed:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status: gatewayStatus })
}

function mapTumaStatus(body: TumaCallbackPayload): GatewayPaymentStatus {
  if (body.result_code === 0 || body.status === 'completed') {
    return 'completed'
  }
  if (body.status === 'failed' || (body.result_code != null && body.result_code !== 0)) {
    return 'failed'
  }
  return 'pending'
}
