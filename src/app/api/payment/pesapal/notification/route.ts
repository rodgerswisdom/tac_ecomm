import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { PaymentService, PaymentVerification, getPaymentConfig } from '@/lib/payments'

async function handleNotification(req: NextRequest) {
  const url = new URL(req.url)
  const search = url.searchParams

  let orderTrackingId =
    search.get('OrderTrackingId') ||
    search.get('orderTrackingId') ||
    search.get('order_tracking_id') ||
    search.get('pesapal_transaction_tracking_id') ||
    undefined

  let merchantReference =
    search.get('OrderMerchantReference') ||
    search.get('merchantReference') ||
    search.get('merchant_reference') ||
    undefined

  // Some IPN calls send the payload in the body instead of query params
  if (!orderTrackingId || !merchantReference) {
    try {
      const body = await req.json()
      if (!orderTrackingId) {
        orderTrackingId =
          body?.OrderTrackingId ||
          body?.orderTrackingId ||
          body?.order_tracking_id ||
          body?.pesapal_transaction_tracking_id
      }
      if (!merchantReference) {
        merchantReference =
          body?.OrderMerchantReference ||
          body?.merchantReference ||
          body?.merchant_reference
      }
    } catch {
      // Ignore body parse errors; we only care about query params
    }
  }

  if (!orderTrackingId) {
    return NextResponse.json({ error: 'Missing orderTrackingId' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: merchantReference
      ? { orderNumber: merchantReference }
      : { payments: { some: { transactionId: orderTrackingId, method: PaymentMethod.PESAPAL } } },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      currency: true,
      payments: {
        where: { method: PaymentMethod.PESAPAL },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true }
      }
    }
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const paymentService = new PaymentService(getPaymentConfig())
  const verification = await paymentService.verifyPayment('pesapal', orderTrackingId, {
    merchantReference: merchantReference ?? order.orderNumber
  })

  const paymentStatus = mapPaymentStatus(verification.status)
  const orderStatus = deriveOrderStatus(paymentStatus, order.status)

  if (order.payments[0]) {
    await prisma.payment.update({
      where: { id: order.payments[0].id },
      data: {
        status: paymentStatus,
        transactionId: verification.transactionId ?? orderTrackingId,
        amount: verification.amount ?? order.total,
        currency: verification.currency ?? order.currency,
        gatewayResponse: JSON.stringify(verification)
      }
    })
  } else {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: PaymentMethod.PESAPAL,
        status: paymentStatus,
        transactionId: verification.transactionId ?? orderTrackingId,
        amount: verification.amount ?? order.total,
        currency: verification.currency ?? order.currency,
        gatewayResponse: JSON.stringify(verification)
      }
    })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus,
      status: orderStatus
    }
  })

  return NextResponse.json({ success: true, status: verification.status })
}

export async function POST(req: NextRequest) {
  return handleNotification(req)
}

export async function GET(req: NextRequest) {
  return handleNotification(req)
}

function mapPaymentStatus(status: PaymentVerification['status']): PaymentStatus {
  switch (status) {
    case 'completed':
      return PaymentStatus.COMPLETED
    case 'pending':
      return PaymentStatus.PENDING
    case 'cancelled':
      return PaymentStatus.CANCELLED
    default:
      return PaymentStatus.FAILED
  }
}

function deriveOrderStatus(nextPaymentStatus: PaymentStatus, currentStatus: OrderStatus): OrderStatus {
  if (nextPaymentStatus === PaymentStatus.COMPLETED) {
    return OrderStatus.CONFIRMED
  }
  if (nextPaymentStatus === PaymentStatus.CANCELLED || nextPaymentStatus === PaymentStatus.FAILED) {
    return OrderStatus.CANCELLED
  }
  return currentStatus
}
