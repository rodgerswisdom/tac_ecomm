import { OrderStatus, PaymentStatus } from '@prisma/client'

export function deriveOrderStatus(nextPaymentStatus: PaymentStatus, currentStatus: OrderStatus): OrderStatus {
  if (nextPaymentStatus === PaymentStatus.COMPLETED) {
    return currentStatus === OrderStatus.PENDING
      ? OrderStatus.CONFIRMED
      : currentStatus
  }

  if (nextPaymentStatus === PaymentStatus.CANCELLED || nextPaymentStatus === PaymentStatus.FAILED) {
    if (currentStatus === OrderStatus.PENDING || currentStatus === OrderStatus.CONFIRMED) {
      return OrderStatus.CANCELLED
    }
    return currentStatus
  }

  return currentStatus
}
