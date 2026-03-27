import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { PaymentService, PaymentVerification, getPaymentConfig } from '@/lib/payments'
import { decrementStock, restoreStock } from '@/lib/stock'
import { deriveOrderStatus } from '@/lib/order-status'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get('orderId')
  const orderTrackingId =
    url.searchParams.get('orderTrackingId') ||
    url.searchParams.get('OrderTrackingId') ||
    url.searchParams.get('pesapal_transaction_tracking_id') ||
    undefined
  const merchantReference =
    url.searchParams.get('merchantReference') ||
    url.searchParams.get('OrderMerchantReference') ||
    undefined

  const baseRedirectUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || url.origin
  const redirectTarget = new URL('/checkout/thank-you', baseRedirectUrl)
  if (orderId) {
    redirectTarget.searchParams.set('orderId', orderId)
  }
  if (orderTrackingId) {
    redirectTarget.searchParams.set('trackingId', orderTrackingId)
  }

  if (!orderId || !orderTrackingId) {
    redirectTarget.searchParams.set('status', 'failed')
    redirectTarget.searchParams.set('message', 'Missing order information')
    return NextResponse.redirect(redirectTarget)
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
    redirectTarget.searchParams.set('status', 'failed')
    redirectTarget.searchParams.set('message', 'Order not found')
    return NextResponse.redirect(redirectTarget)
  }

  try {
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

    const redirectStatus = verification.success
      ? 'success'
      : verification.status === 'pending'
        ? 'pending'
        : verification.status === 'cancelled'
          ? 'cancelled'
          : 'failed'

    redirectTarget.searchParams.set('status', redirectStatus)
    return NextResponse.redirect(redirectTarget)
  } catch (error) {
    console.error('Pesapal verification failed', error)
    redirectTarget.searchParams.set('status', 'failed')
    redirectTarget.searchParams.set('message', 'Could not verify payment')
    return NextResponse.redirect(redirectTarget)
  }
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

