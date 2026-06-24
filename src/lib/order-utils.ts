import { OrderStatus, PaymentStatus } from "@prisma/client"

/**
 * Get the color/variant for an order status badge
 */
export function getOrderStatusVariant(
  status: OrderStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case OrderStatus.PENDING:
      return "secondary"
    case OrderStatus.CONFIRMED:
      return "default"
    case OrderStatus.PROCESSING:
      return "default"
    case OrderStatus.SHIPPED:
      return "default"
    case OrderStatus.DELIVERED:
      return "outline"
    case OrderStatus.CANCELLED:
      return "destructive"
    case OrderStatus.REFUNDED:
      return "destructive"
    default:
      return "secondary"
  }
}

/**
 * Get the color class for an order status
 */
export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case OrderStatus.CONFIRMED:
      return "text-blue-600 bg-blue-50 border-blue-200"
    case OrderStatus.PROCESSING:
      return "text-purple-600 bg-purple-50 border-purple-200"
    case OrderStatus.SHIPPED:
      return "text-indigo-600 bg-indigo-50 border-indigo-200"
    case OrderStatus.DELIVERED:
      return "text-green-600 bg-green-50 border-green-200"
    case OrderStatus.CANCELLED:
      return "text-red-600 bg-red-50 border-red-200"
    case OrderStatus.REFUNDED:
      return "text-orange-600 bg-orange-50 border-orange-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

/**
 * Get the color class for a payment status
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case PaymentStatus.COMPLETED:
      return "text-green-600 bg-green-50 border-green-200"
    case PaymentStatus.FAILED:
      return "text-red-600 bg-red-50 border-red-200"
    case PaymentStatus.REFUNDED:
      return "text-orange-600 bg-orange-50 border-orange-200"
    case PaymentStatus.CANCELLED:
      return "text-gray-600 bg-gray-50 border-gray-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

/**
 * Format order status text for display
 */
export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending"
    case OrderStatus.CONFIRMED:
      return "Confirmed"
    case OrderStatus.PROCESSING:
      return "Processing"
    case OrderStatus.SHIPPED:
      return "Shipped"
    case OrderStatus.DELIVERED:
      return "Delivered"
    case OrderStatus.CANCELLED:
      return "Cancelled"
    case OrderStatus.REFUNDED:
      return "Refunded"
    default:
      return status
  }
}

/**
 * Format payment status text for display
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return "Pending"
    case PaymentStatus.COMPLETED:
      return "Completed"
    case PaymentStatus.FAILED:
      return "Failed"
    case PaymentStatus.REFUNDED:
      return "Refunded"
    case PaymentStatus.CANCELLED:
      return "Cancelled"
    default:
      return status
  }
}

/**
 * Check if an order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return (
    status === OrderStatus.PENDING ||
    status === OrderStatus.CONFIRMED ||
    status === OrderStatus.PROCESSING
  )
}

/**
 * Calculate order progress percentage based on status
 */
export function getOrderProgress(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.PENDING:
      return 10
    case OrderStatus.CONFIRMED:
      return 25
    case OrderStatus.PROCESSING:
      return 50
    case OrderStatus.SHIPPED:
      return 75
    case OrderStatus.DELIVERED:
      return 100
    case OrderStatus.CANCELLED:
      return 0
    case OrderStatus.REFUNDED:
      return 0
    default:
      return 0
  }
}

/**
 * Get order timeline steps based on current status
 */
export function getOrderTimelineSteps(status: OrderStatus) {
  const allSteps = [
    {
      status: OrderStatus.PENDING,
      label: "Order Placed",
      description: "Your order has been received",
    },
    {
      status: OrderStatus.CONFIRMED,
      label: "Payment Confirmed",
      description: "Payment has been verified",
    },
    {
      status: OrderStatus.PROCESSING,
      label: "Processing",
      description: "Your order is being prepared",
    },
    {
      status: OrderStatus.SHIPPED,
      label: "Shipped",
      description: "Your order is on the way",
    },
    {
      status: OrderStatus.DELIVERED,
      label: "Delivered",
      description: "Order has been delivered",
    },
  ]

  // Handle cancelled/refunded orders
  if (status === OrderStatus.CANCELLED) {
    return [
      {
        status: OrderStatus.PENDING,
        label: "Order Placed",
        description: "Your order was received",
      },
      {
        status: OrderStatus.CANCELLED,
        label: "Cancelled",
        description: "Order has been cancelled",
      },
    ]
  }

  if (status === OrderStatus.REFUNDED) {
    return [
      ...allSteps,
      {
        status: OrderStatus.REFUNDED,
        label: "Refunded",
        description: "Order has been refunded",
      },
    ]
  }

  return allSteps
}

/**
 * Check if a timeline step is completed
 */
export function isStepCompleted(
  currentStatus: OrderStatus,
  stepStatus: OrderStatus
): boolean {
  const statusOrder: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ]

  const currentIndex = statusOrder.indexOf(currentStatus)
  const stepIndex = statusOrder.indexOf(stepStatus)

  // If status not in order (cancelled/refunded), return false
  if (currentIndex === -1 || stepIndex === -1) return false

  return currentIndex >= stepIndex
}

/**
 * Check if a timeline step is current
 */
export function isStepCurrent(
  currentStatus: OrderStatus,
  stepStatus: OrderStatus
): boolean {
  return currentStatus === stepStatus
}

/**
 * Format order date for display
 */
export function formatOrderDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/**
 * Format order date with time
 */
export function formatOrderDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = "KSH"): string {
  return `${currency} ${amount.toFixed(2)}`
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`
    }
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`
  }

  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return months === 1 ? "1 month ago" : `${months} months ago`
  }

  const years = Math.floor(diffInDays / 365)
  return years === 1 ? "1 year ago" : `${years} years ago`
}

// Made with Bob
