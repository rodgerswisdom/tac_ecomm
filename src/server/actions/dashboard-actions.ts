"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrderStatus, PaymentStatus } from "@prisma/client"

export type DashboardStats = {
  totalOrders: number
  totalSpent: number
  activeOrders: number
  completedOrders: number
  memberSince: Date
}

export type OrderFilters = {
  status?: OrderStatus | 'ALL'
  sortBy?: 'newest' | 'oldest'
  page?: number
  limit?: number
  search?: string
}

export type OrderListItem = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  total: number
  currency: string
  createdAt: Date
  itemCount: number
  items: Array<{
    quantity: number
    product: {
      name: string
      images: string[]
    } | null
  }>
}

export type OrderDetail = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  paymentMethod: string | null
  shippingMethod: string | null
  trackingNumber: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string | null
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      slug: string
      images: string[]
    } | null
  }>
}

/**
 * Get dashboard statistics for the authenticated user
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const userId = session.user.id

  try {
    // Get all orders for the user
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        total: true,
        status: true,
        createdAt: true,
      },
    })

    // Get user creation date
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
    const activeOrders = orders.filter(
      (order) =>
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.CONFIRMED ||
        order.status === OrderStatus.PROCESSING ||
        order.status === OrderStatus.SHIPPED
    ).length
    const completedOrders = orders.filter(
      (order) => order.status === OrderStatus.DELIVERED
    ).length

    return {
      totalOrders,
      totalSpent,
      activeOrders,
      completedOrders,
      memberSince: user?.createdAt || new Date(),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return null
  }
}

/**
 * Get filtered and paginated orders for the authenticated user
 */
export async function getFilteredOrders(
  filters: OrderFilters = {}
): Promise<{ orders: OrderListItem[]; total: number; hasMore: boolean }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { orders: [], total: 0, hasMore: false }
  }

  const userId = session.user.id
  const {
    status = 'ALL',
    sortBy = 'newest',
    page = 1,
    limit = 10,
    search = '',
  } = filters

  try {
    // Build where clause
    const where: any = { userId }

    if (status !== 'ALL') {
      where.status = status
    }

    if (search) {
      where.orderNumber = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Get total count
    const total = await prisma.order.count({ where })

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        currency: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: sortBy === 'newest' ? 'desc' : 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const orderListItems: OrderListItem[] = orders.map((order) => ({
      ...order,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }))

    return {
      orders: orderListItems,
      total,
      hasMore: page * limit < total,
    }
  } catch (error) {
    console.error("Error fetching filtered orders:", error)
    return { orders: [], total: 0, hasMore: false }
  }
}

/**
 * Get order details by order number for the authenticated user
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderDetail | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const userId = session.user.id

  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId,
      },
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return null
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: {
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone,
      },
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
      })),
    }
  } catch (error) {
    console.error("Error fetching order by number:", error)
    return null
  }
}

/**
 * Get recent orders for dashboard overview (last 5)
 */
export async function getRecentOrders(): Promise<OrderListItem[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const userId = session.user.id

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        currency: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    return orders.map((order) => ({
      ...order,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return []
  }
}

// Made with Bob
