/**
 * Zoho Sync Helper Functions
 * Common utilities for synchronization operations
 */

import { zohoSyncQueue } from './queue'
import type { EntityType, SyncAction } from './queue'

/**
 * Queue product sync
 */
export async function queueProductSync(
  productId: string,
  action: SyncAction = 'create'
): Promise<string> {
  return zohoSyncQueue.enqueue('product', productId, action, 1)
}

/**
 * Queue customer sync
 */
export async function queueCustomerSync(
  userId: string,
  action: SyncAction = 'create'
): Promise<string> {
  return zohoSyncQueue.enqueue('customer', userId, action, 2)
}

/**
 * Queue order sync (with dependencies)
 */
export async function queueOrderSync(orderId: string): Promise<{
  orderSyncId: string
  customerSyncId?: string
}> {
  const { prisma } = await import('@/lib/prisma')
  
  // Get order with user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  })

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  const result: { orderSyncId: string; customerSyncId?: string } = {
    orderSyncId: '',
  }

  // Queue customer sync if not already synced
  if (!order.user.zohoContactId) {
    result.customerSyncId = await queueCustomerSync(order.userId)
  }

  // Queue order sync
  result.orderSyncId = await zohoSyncQueue.enqueue('order', orderId, 'create', 3)

  return result
}

/**
 * Queue invoice creation
 */
export async function queueInvoiceCreation(orderId: string): Promise<string> {
  return zohoSyncQueue.enqueue('invoice', orderId, 'create', 4)
}

/**
 * Queue payment recording
 */
export async function queuePaymentRecording(paymentId: string): Promise<string> {
  return zohoSyncQueue.enqueue('payment', paymentId, 'create', 5)
}

/**
 * Queue complete order flow (order + invoice + payment)
 */
export async function queueCompleteOrderFlow(
  orderId: string,
  paymentId?: string
): Promise<{
  orderSyncId: string
  invoiceSyncId: string
  paymentSyncId?: string
}> {
  // Queue order sync
  const { orderSyncId } = await queueOrderSync(orderId)

  // Queue invoice creation
  const invoiceSyncId = await queueInvoiceCreation(orderId)

  // Queue payment if provided
  let paymentSyncId: string | undefined
  if (paymentId) {
    paymentSyncId = await queuePaymentRecording(paymentId)
  }

  return {
    orderSyncId,
    invoiceSyncId,
    paymentSyncId,
  }
}

/**
 * Check if entity is synced to Zoho
 */
export async function isEntitySynced(
  entityType: EntityType,
  entityId: string
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma')

  switch (entityType) {
    case 'product': {
      const product = await prisma.product.findUnique({
        where: { id: entityId },
        select: { zohoItemId: true },
      })
      return !!product?.zohoItemId
    }

    case 'customer': {
      const user = await prisma.user.findUnique({
        where: { id: entityId },
        select: { zohoContactId: true },
      })
      return !!user?.zohoContactId
    }

    case 'order': {
      const order = await prisma.order.findUnique({
        where: { id: entityId },
        select: { zohoSalesOrderId: true },
      })
      return !!order?.zohoSalesOrderId
    }

    case 'invoice': {
      const order = await prisma.order.findUnique({
        where: { id: entityId },
        select: { zohoInvoiceId: true },
      })
      return !!order?.zohoInvoiceId
    }

    case 'payment': {
      const payment = await prisma.payment.findUnique({
        where: { id: entityId },
        select: { zohoPaymentId: true },
      })
      return !!payment?.zohoPaymentId
    }

    default:
      return false
  }
}

/**
 * Get sync status for entity
 */
export async function getEntitySyncStatus(
  entityType: EntityType,
  entityId: string
): Promise<{
  synced: boolean
  zohoId?: string
  status?: string
  lastSyncedAt?: Date
  error?: string
}> {
  const { prisma } = await import('@/lib/prisma')

  let zohoId: string | null = null
  let status: string | null = null
  let lastSyncedAt: Date | null = null
  let error: string | null = null

  switch (entityType) {
    case 'product': {
      const product = await prisma.product.findUnique({
        where: { id: entityId },
        select: {
          zohoItemId: true,
          zohoSyncStatus: true,
          lastSyncedAt: true,
          syncError: true,
        },
      })
      if (product) {
        zohoId = product.zohoItemId
        status = product.zohoSyncStatus
        lastSyncedAt = product.lastSyncedAt
        error = product.syncError
      }
      break
    }

    case 'customer': {
      const user = await prisma.user.findUnique({
        where: { id: entityId },
        select: {
          zohoContactId: true,
          zohoSyncStatus: true,
          lastSyncedAt: true,
          syncError: true,
        },
      })
      if (user) {
        zohoId = user.zohoContactId
        status = user.zohoSyncStatus
        lastSyncedAt = user.lastSyncedAt
        error = user.syncError
      }
      break
    }

    case 'order': {
      const order = await prisma.order.findUnique({
        where: { id: entityId },
        select: {
          zohoSalesOrderId: true,
          zohoSyncStatus: true,
          lastSyncedAt: true,
          syncError: true,
        },
      })
      if (order) {
        zohoId = order.zohoSalesOrderId
        status = order.zohoSyncStatus
        lastSyncedAt = order.lastSyncedAt
        error = order.syncError
      }
      break
    }

    case 'payment': {
      const payment = await prisma.payment.findUnique({
        where: { id: entityId },
        select: {
          zohoPaymentId: true,
          zohoSyncStatus: true,
          lastSyncedAt: true,
          syncError: true,
        },
      })
      if (payment) {
        zohoId = payment.zohoPaymentId
        status = payment.zohoSyncStatus
        lastSyncedAt = payment.lastSyncedAt
        error = payment.syncError
      }
      break
    }
  }

  return {
    synced: !!zohoId,
    zohoId: zohoId || undefined,
    status: status || undefined,
    lastSyncedAt: lastSyncedAt || undefined,
    error: error || undefined,
  }
}

/**
 * Batch queue products for sync
 */
export async function batchQueueProducts(
  productIds: string[],
  action: SyncAction = 'create'
): Promise<string[]> {
  const syncIds: string[] = []

  for (const productId of productIds) {
    const syncId = await queueProductSync(productId, action)
    syncIds.push(syncId)
  }

  return syncIds
}

/**
 * Get pending sync count for entity type
 */
export async function getPendingSyncCount(
  entityType?: EntityType
): Promise<number> {
  const { prisma } = await import('@/lib/prisma')

  const where = entityType
    ? { entityType, status: 'pending' as const }
    : { status: 'pending' as const }

  return prisma.zohoSyncLog.count({ where })
}
