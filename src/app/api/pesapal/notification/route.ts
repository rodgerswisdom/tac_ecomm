import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { PaymentService, PaymentVerification, getPaymentConfig } from '@/lib/payments'
import { decrementStock, restoreStock } from '@/lib/stock'
import { deriveOrderStatus } from '@/lib/order-status'

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
      userId: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      currency: true,
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true
        }
      },
      payments: {
        where: { method: PaymentMethod.PESAPAL },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, currency: true }
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
  const nextOrderStatus = deriveOrderStatus(paymentStatus, order.status)
  const existingPayment = order.payments[0]
  const paymentCurrency = 'KES'
  await prisma.$transaction(async (tx) => {
    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: paymentStatus,
          transactionId: verification.transactionId ?? orderTrackingId,
          amount: verification.amount ?? order.total,
          currency: paymentCurrency,
          gatewayResponse: JSON.stringify(verification)
        }
      })
    } else {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.PESAPAL,
          status: paymentStatus,
          transactionId: verification.transactionId ?? orderTrackingId,
          amount: verification.amount ?? order.total,
          currency: paymentCurrency,
          gatewayResponse: JSON.stringify(verification)
        }
      })
    }

    if (paymentStatus === PaymentStatus.COMPLETED) {
      await tx.cartItem.deleteMany({
        where: { userId: order.userId }
      })
    }

    if (nextOrderStatus === order.status) {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus }
      })
      return
    }

    if (order.status === OrderStatus.PENDING && nextOrderStatus === OrderStatus.CONFIRMED) {
      const transition = await tx.order.updateMany({
        where: { id: order.id, status: OrderStatus.PENDING },
        data: { paymentStatus, status: OrderStatus.CONFIRMED }
      })

      if (transition.count > 0) {
        await decrementStock(order.items, tx)
        return
      }

      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus }
      })
      return
    }

    if (order.status === OrderStatus.CONFIRMED && nextOrderStatus === OrderStatus.CANCELLED) {
      const transition = await tx.order.updateMany({
        where: { id: order.id, status: OrderStatus.CONFIRMED },
        data: { paymentStatus, status: OrderStatus.CANCELLED }
      })

      if (transition.count > 0) {
        await restoreStock(order.id, tx)
        return
      }

      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus }
      })
      return
    }

    const transition = await tx.order.updateMany({
      where: { id: order.id, status: order.status },
      data: { paymentStatus, status: nextOrderStatus }
    })

    if (transition.count === 0) {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus }
      })
      return
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

