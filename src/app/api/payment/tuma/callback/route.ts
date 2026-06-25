import { NextRequest, NextResponse } from 'next/server'
import { PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { applyPaymentUpdate, type GatewayPaymentStatus } from '@/lib/order-payment-update'

type TumaCallbackPayload = {
  status?: string
  merchant_request_id?: string
  checkout_request_id?: string
  result_code?: number | string
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

  console.info('[tuma/callback] received', {
    orderId,
    checkout_request_id: checkoutRequestId,
    merchant_request_id: merchantRequestId,
    result_code: body.result_code,
    status: body.status,
    mpesa_receipt_number: body.mpesa_receipt_number
  })

  if (!orderId && !checkoutRequestId && !merchantRequestId) {
    return NextResponse.json({ error: 'Missing order or transaction identifiers' }, { status: 400 })
  }

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, paymentStatus: true }
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
        select: { id: true, paymentStatus: true }
      })

  if (!order) {
    console.error('[tuma/callback] Order not found', { orderId, checkoutRequestId, merchantRequestId })
    // Acknowledge so Tuma does not retry indefinitely for unknown orders
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 200 })
  }

  const gatewayStatus = mapTumaStatus(body)
  const transactionId =
    checkoutRequestId ||
    merchantRequestId ||
    (typeof body.mpesa_receipt_number === 'string' ? body.mpesa_receipt_number : 'unknown')

  if (order.paymentStatus === PaymentStatus.COMPLETED && gatewayStatus === 'completed') {
    return NextResponse.json({ success: true, status: gatewayStatus, duplicate: true })
  }

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
    console.error('[tuma/callback] processing failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 200 })
  }

  console.info('[tuma/callback] applied', {
    orderId: order.id,
    gatewayStatus,
    transactionId
  })

  return NextResponse.json({ success: true, status: gatewayStatus })
}

function mapTumaStatus(body: TumaCallbackPayload): GatewayPaymentStatus {
  const resultCode =
    body.result_code === 0 ||
    body.result_code === '0' ||
    Number(body.result_code) === 0

  if (resultCode || body.status === 'completed') {
    return 'completed'
  }
  if (body.status === 'failed' || (body.result_code != null && !resultCode)) {
    return 'failed'
  }
  return 'pending'
}
