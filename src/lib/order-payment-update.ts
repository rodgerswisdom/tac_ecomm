import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { decrementStock, restoreStock } from '@/lib/stock'
import { deriveOrderStatus } from '@/lib/order-status'
import { sendPaidOrderConfirmedEmail } from '@/lib/order-email'

export type GatewayPaymentStatus = 'completed' | 'pending' | 'failed' | 'cancelled'

export type ApplyPaymentUpdateInput = {
  orderId: string
  method: PaymentMethod
  gatewayStatus: GatewayPaymentStatus
  transactionId: string
  amount?: number
  currency?: string
  gatewayResponse: unknown
}

export async function applyPaymentUpdate(input: ApplyPaymentUpdateInput): Promise<{
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  emailSent: boolean
}> {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      userId: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true
        }
      },
      payments: {
        where: { method: input.method },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true }
      }
    }
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const paymentStatus = mapGatewayStatus(input.gatewayStatus)
  const nextOrderStatus = deriveOrderStatus(paymentStatus, order.status)
  const existingPayment = order.payments[0]
  const paymentCurrency = input.currency ?? 'KES'
  let shouldSendPaidEmail = false

  await prisma.$transaction(async (tx) => {
    const gatewayResponseJson = JSON.stringify(input.gatewayResponse)

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: paymentStatus,
          transactionId: input.transactionId,
          amount: input.amount ?? order.total,
          currency: paymentCurrency,
          gatewayResponse: gatewayResponseJson
        }
      })
    } else {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: input.method,
          status: paymentStatus,
          transactionId: input.transactionId,
          amount: input.amount ?? order.total,
          currency: paymentCurrency,
          gatewayResponse: gatewayResponseJson
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
        shouldSendPaidEmail = true
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
    }
  })

  if (shouldSendPaidEmail) {
    try {
      await sendPaidOrderConfirmedEmail(order.id)
    } catch (error) {
      console.error('Failed to send paid order confirmation email:', error)
    }
  }

  return {
    paymentStatus,
    orderStatus: nextOrderStatus,
    emailSent: shouldSendPaidEmail
  }
}

function mapGatewayStatus(status: GatewayPaymentStatus): PaymentStatus {
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
