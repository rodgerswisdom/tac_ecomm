/**
 * Zoho Books Sync Queue Manager
 * 
 * Handles asynchronous synchronization with priority-based processing
 * and automatic dependency resolution.
 * 
 * Priority Levels:
 * 1 - Products (must sync first)
 * 2 - Customers (needed for orders)
 * 3 - Orders (needs products + customers)
 * 4 - Invoices (needs orders)
 * 5 - Payments (needs invoices)
 */

import { prisma } from '@/lib/prisma'
import { logZohoEvent } from './monitoring'
import {
  createZohoItem,
  updateZohoItem,
} from './services/items'
import {
  createZohoContact,
  updateZohoContact,
} from './services/contacts'
import {
  createZohoSalesOrder,
} from './services/sales-orders'
import {
  createZohoInvoiceFromSalesOrder,
} from './services/invoices'
import {
  recordZohoPayment,
} from './services/payments'

// Entity type definitions
export type EntityType = 'product' | 'customer' | 'order' | 'invoice' | 'payment'
export type SyncAction = 'create' | 'update' | 'delete'
export type SyncStatus = 'pending' | 'processing' | 'success' | 'failed'

// Priority mapping
const PRIORITY_MAP: Record<EntityType, number> = {
  product: 1,
  customer: 2,
  order: 3,
  invoice: 4,
  payment: 5,
}

interface QueueStats {
  processed: number
  succeeded: number
  failed: number
  remaining: number
}

export class ZohoSyncQueue {
  /**
   * Add item to sync queue
   */
  async enqueue(
    entityType: EntityType,
    entityId: string,
    action: SyncAction,
    priority?: number
  ): Promise<string> {
    // Use default priority if not specified
    const finalPriority = priority ?? PRIORITY_MAP[entityType]

    // Check if already queued
    const existing = await prisma.zohoSyncLog.findFirst({
      where: {
        entityType,
        entityId,
        status: { in: ['pending', 'processing'] },
      },
    })

    if (existing) {
      return existing.id
    }

    // Create sync log entry
    const syncLog = await prisma.zohoSyncLog.create({
      data: {
        entityType,
        entityId,
        action,
        status: 'pending',
        priority: finalPriority,
        scheduledFor: new Date(),
      },
    })

    return syncLog.id
  }

  /**
   * Check if entity dependencies are met
   */
  private async checkDependencies(
    entityType: EntityType,
    entityId: string
  ): Promise<{ ready: boolean; reason?: string }> {
    switch (entityType) {
      case 'product':
        // Products have no dependencies
        return { ready: true }

      case 'customer':
        // Customers have no dependencies
        return { ready: true }

      case 'order': {
        // Orders need customer and all products to be synced
        const order = await prisma.order.findUnique({
          where: { id: entityId },
          include: {
            user: true,
            items: {
              include: { product: true },
            },
          },
        })

        if (!order) {
          return { ready: false, reason: 'Order not found' }
        }

        // Check if customer is synced
        if (!order.user.zohoContactId) {
          return {
            ready: false,
            reason: `Customer not synced: ${order.userId}`,
          }
        }

        // Check if all products are synced
        for (const item of order.items) {
          if (!item.product.zohoItemId) {
            return {
              ready: false,
              reason: `Product not synced: ${item.product.name} (${item.productId})`,
            }
          }
        }

        return { ready: true }
      }

      case 'invoice': {
        // Invoices need the order to have a sales order ID
        const order = await prisma.order.findUnique({
          where: { id: entityId },
        })

        if (!order) {
          return { ready: false, reason: 'Order not found' }
        }

        if (!order.zohoSalesOrderId) {
          return {
            ready: false,
            reason: `Order not synced: ${entityId}`,
          }
        }

        return { ready: true }
      }

      case 'payment': {
        // Payments need the order to have an invoice ID
        const payment = await prisma.payment.findUnique({
          where: { id: entityId },
          include: { order: true },
        })

        if (!payment) {
          return { ready: false, reason: 'Payment not found' }
        }

        if (!payment.order.zohoInvoiceId) {
          return {
            ready: false,
            reason: `Order invoice not synced: ${payment.orderId}`,
          }
        }

        return { ready: true }
      }

      default:
        return { ready: false, reason: 'Unknown entity type' }
    }
  }

  /**
   * Process a single sync log entry
   */
  private async processSyncLog(logId: string): Promise<boolean> {
    // Get sync log
    const log = await prisma.zohoSyncLog.findUnique({
      where: { id: logId },
    })

    if (!log || log.status !== 'pending') {
      return false
    }

    // Mark as processing
    await prisma.zohoSyncLog.update({
      where: { id: logId },
      data: {
        status: 'processing',
        processedAt: new Date(),
      },
    })

    try {
      // Check dependencies
      const depCheck = await this.checkDependencies(
        log.entityType as EntityType,
        log.entityId
      )

      if (!depCheck.ready) {
        // Dependencies not met, reschedule for later
        await prisma.zohoSyncLog.update({
          where: { id: logId },
          data: {
            status: 'pending',
            errorMessage: depCheck.reason,
            scheduledFor: new Date(Date.now() + 60000), // Retry in 1 minute
          },
        })
        return false
      }

      // Process based on entity type and action
      let zohoId: string | undefined

      switch (log.entityType) {
        case 'product':
          if (log.action === 'create') {
            zohoId = await createZohoItem(log.entityId)
          } else if (log.action === 'update') {
            await updateZohoItem(log.entityId)
          }
          break

        case 'customer':
          if (log.action === 'create') {
            zohoId = await createZohoContact(log.entityId)
          } else if (log.action === 'update') {
            await updateZohoContact(log.entityId)
          }
          break

        case 'order':
          if (log.action === 'create') {
            zohoId = await createZohoSalesOrder(log.entityId)
          }
          break

        case 'invoice':
          if (log.action === 'create') {
            zohoId = await createZohoInvoiceFromSalesOrder(log.entityId)
          }
          break

        case 'payment':
          if (log.action === 'create') {
            zohoId = await recordZohoPayment(log.entityId)
          }
          break

        default:
          throw new Error(`Unknown entity type: ${log.entityType}`)
      }

      // Mark as success
      await prisma.zohoSyncLog.update({
        where: { id: logId },
        data: {
          status: 'success',
          zohoId,
          errorMessage: null,
          errorCode: null,
        },
      })

      // Update stats
      await this.updateStats('success')

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const retryCount = log.retryCount + 1

      // Check if we should retry
      if (retryCount < log.maxRetries) {
        // Schedule retry with exponential backoff
        const delayMs = Math.pow(2, retryCount) * 5000 // 5s, 10s, 20s
        await prisma.zohoSyncLog.update({
          where: { id: logId },
          data: {
            status: 'pending',
            retryCount,
            errorMessage,
            scheduledFor: new Date(Date.now() + delayMs),
          },
        })
      } else {
        // Max retries exceeded, mark as failed
        await prisma.zohoSyncLog.update({
          where: { id: logId },
          data: {
            status: 'failed',
            errorMessage,
            retryCount,
          },
        })

        // Update stats
        await this.updateStats('failed')
      }

      return false
    }
  }

  /**
   * Process queue (batch processing)
   */
  async processQueue(batchSize: number = 10): Promise<QueueStats> {
    const stats: QueueStats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      remaining: 0,
    }

    // Get pending items ordered by priority and scheduled time
    const pendingLogs = await prisma.zohoSyncLog.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: new Date() },
      },
      orderBy: [
        { priority: 'asc' },
        { scheduledFor: 'asc' },
      ],
      take: batchSize,
    })

    // Process each log
    for (const log of pendingLogs) {
      stats.processed++
      const success = await this.processSyncLog(log.id)
      if (success) {
        stats.succeeded++
      } else {
        stats.failed++
      }
    }

    // Count remaining items
    stats.remaining = await prisma.zohoSyncLog.count({
      where: {
        status: 'pending',
      },
    })

    return stats
  }

  /**
   * Update sync statistics
   */
  private async updateStats(result: 'success' | 'failed'): Promise<void> {
    const now = new Date()

    await prisma.zohoSyncStats.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        totalSynced: result === 'success' ? 1 : 0,
        totalFailed: result === 'failed' ? 1 : 0,
        lastSyncAt: now,
        lastSuccessAt: result === 'success' ? now : undefined,
        lastFailureAt: result === 'failed' ? now : undefined,
      },
      update: {
        totalSynced: result === 'success' ? { increment: 1 } : undefined,
        totalFailed: result === 'failed' ? { increment: 1 } : undefined,
        lastSyncAt: now,
        lastSuccessAt: result === 'success' ? now : undefined,
        lastFailureAt: result === 'failed' ? now : undefined,
      },
    })
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number
    processing: number
    failed: number
    byEntityType: Record<string, number>
  }> {
    const [pending, processing, failed, byType] = await Promise.all([
      prisma.zohoSyncLog.count({ where: { status: 'pending' } }),
      prisma.zohoSyncLog.count({ where: { status: 'processing' } }),
      prisma.zohoSyncLog.count({ where: { status: 'failed' } }),
      prisma.zohoSyncLog.groupBy({
        by: ['entityType'],
        where: { status: 'pending' },
        _count: true,
      }),
    ])

    const byEntityType: Record<string, number> = {}
    for (const group of byType) {
      byEntityType[group.entityType] = group._count
    }

    return {
      pending,
      processing,
      failed,
      byEntityType,
    }
  }

  /**
   * Retry failed syncs
   */
  async retryFailed(limit: number = 10): Promise<number> {
    const failedLogs = await prisma.zohoSyncLog.findMany({
      where: { status: 'failed' },
      take: limit,
    })

    for (const log of failedLogs) {
      await prisma.zohoSyncLog.update({
        where: { id: log.id },
        data: {
          status: 'pending',
          retryCount: 0,
          scheduledFor: new Date(),
          errorMessage: null,
          errorCode: null,
        },
      })
    }

    return failedLogs.length
  }

  /**
   * Clear old successful logs (cleanup)
   */
  async cleanupOldLogs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.zohoSyncLog.deleteMany({
      where: {
        status: 'success',
        createdAt: { lt: cutoffDate },
      },
    })

    return result.count
  }
}

// Export singleton instance
export const zohoSyncQueue = new ZohoSyncQueue()
