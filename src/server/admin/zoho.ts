"use server"

import { requireAdmin } from "./auth"
import { prisma } from "@/lib/prisma"

export type ZohoSyncStatus = "PENDING" | "SYNCED" | "FAILED" | "RETRYING"
export type ZohoEntityType = "PRODUCT" | "CUSTOMER" | "ORDER" | "INVOICE" | "PAYMENT"

const MAX_SYNC_ATTEMPTS = 5

export type ZohoSyncLogWithDetails = {
  id: string
  entityType: ZohoEntityType
  entityId: string
  status: ZohoSyncStatus
  priority: number
  attempts: number
  maxAttempts: number
  error: string | null
  createdAt: Date
  updatedAt: Date
  processedAt: Date | null
  entityDetails?: {
    name?: string
    email?: string
    orderNumber?: string
  }
}

export type ZohoStatsData = {
  totalSynced: number
  totalPending: number
  totalFailed: number
  totalRetrying: number
  syncsByEntity: Array<{
    entityType: ZohoEntityType
    synced: number
    pending: number
    failed: number
  }>
  recentActivity: Array<{
    date: string
    synced: number
    failed: number
  }>
}

export async function getZohoSyncLogs(params: {
  page?: number
  limit?: number
  status?: ZohoSyncStatus
  entityType?: ZohoEntityType
}) {
  await requireAdmin()

  const { page = 1, limit = 20, status, entityType } = params
  const skip = (page - 1) * limit

  // Map uppercase status to lowercase for database query
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'SYNCED': 'success',
    'FAILED': 'failed',
    'RETRYING': 'retrying',
  }

  // Map uppercase entity type to lowercase for database query
  const entityTypeMap: Record<string, string> = {
    'PRODUCT': 'product',
    'CUSTOMER': 'customer',
    'ORDER': 'order',
    'INVOICE': 'invoice',
    'PAYMENT': 'payment',
  }

  const where = {
    ...(status && { status: statusMap[status] || status.toLowerCase() }),
    ...(entityType && { entityType: entityTypeMap[entityType] || entityType.toLowerCase() }),
  }

  const [logs, total] = await Promise.all([
    prisma.zohoSyncLog.findMany({
      where,
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.zohoSyncLog.count({ where }),
  ])

  // Enrich logs with entity details
  const enrichedLogs: ZohoSyncLogWithDetails[] = await Promise.all(
    logs.map(async (log) => {
      let entityDetails: ZohoSyncLogWithDetails["entityDetails"] = undefined

      try {
        switch (log.entityType) {
          case "PRODUCT": {
            const product = await prisma.product.findUnique({
              where: { id: log.entityId },
              select: { name: true },
            })
            if (product) entityDetails = { name: product.name }
            break
          }
          case "CUSTOMER": {
            const user = await prisma.user.findUnique({
              where: { id: log.entityId },
              select: { name: true, email: true },
            })
            if (user) entityDetails = { name: user.name ?? undefined, email: user.email }
            break
          }
          case "ORDER": {
            const order = await prisma.order.findUnique({
              where: { id: log.entityId },
              select: { orderNumber: true },
            })
            if (order) entityDetails = { orderNumber: order.orderNumber }
            break
          }
          case "INVOICE": {
            const order = await prisma.order.findUnique({
              where: { id: log.entityId },
              select: { orderNumber: true },
            })
            if (order) entityDetails = { orderNumber: order.orderNumber }
            break
          }
          case "PAYMENT": {
            const order = await prisma.order.findUnique({
              where: { id: log.entityId },
              select: { orderNumber: true },
            })
            if (order) entityDetails = { orderNumber: order.orderNumber }
            break
          }
        }
      } catch (error) {
        // Ignore errors in enrichment
      }

      return {
        id: log.id,
        entityType: log.entityType as ZohoEntityType,
        entityId: log.entityId,
        status: log.status as ZohoSyncStatus,
        priority: log.priority,
        attempts: log.retryCount,
        maxAttempts: MAX_SYNC_ATTEMPTS,
        error: log.errorMessage,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        processedAt: null,
        entityDetails,
      }
    })
  )

  return {
    logs: enrichedLogs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getZohoStats(): Promise<ZohoStatsData> {
  await requireAdmin()

  // Get overall counts (database uses lowercase status values)
  const [totalSynced, totalPending, totalFailed, totalRetrying] = await Promise.all([
    prisma.zohoSyncLog.count({ where: { status: "success" } }),
    prisma.zohoSyncLog.count({ where: { status: "pending" } }),
    prisma.zohoSyncLog.count({ where: { status: "failed" } }),
    prisma.zohoSyncLog.count({ where: { status: "retrying" } }),
  ])

  // Get counts by entity type (database uses lowercase entity types)
  const entityTypes = ["product", "customer", "order", "invoice", "payment"]
  const syncsByEntity = await Promise.all(
    entityTypes.map(async (entityType) => {
      const [synced, pending, failed] = await Promise.all([
        prisma.zohoSyncLog.count({ where: { entityType, status: "success" } }),
        prisma.zohoSyncLog.count({ where: { entityType, status: "pending" } }),
        prisma.zohoSyncLog.count({ where: { entityType, status: "failed" } }),
      ])
      return {
        entityType: entityType.toUpperCase() as ZohoEntityType,
        synced,
        pending,
        failed
      }
    })
  )

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentLogs = await prisma.zohoSyncLog.findMany({
    where: {
      updatedAt: { gte: sevenDaysAgo },
      status: { in: ["success", "failed"] },
    },
    select: {
      status: true,
      updatedAt: true,
    },
  })

  // Group by date
  const activityMap = new Map<string, { synced: number; failed: number }>()
  recentLogs.forEach((log) => {
    const date = log.updatedAt.toISOString().split("T")[0]!
    const current = activityMap.get(date) ?? { synced: 0, failed: 0 }
    if (log.status === "success") current.synced++
    if (log.status === "failed") current.failed++
    activityMap.set(date, current)
  })

  const recentActivity = Array.from(activityMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalSynced,
    totalPending,
    totalFailed,
    totalRetrying,
    syncsByEntity,
    recentActivity,
  }
}

export async function retryFailedSync(logId: string) {
  await requireAdmin()

  const log = await prisma.zohoSyncLog.findUnique({
    where: { id: logId },
  })

  if (!log) {
    throw new Error("Sync log not found")
  }

  if (log.status !== "FAILED") {
    throw new Error("Only failed syncs can be retried")
  }

  // Reset the log to pending with incremented attempts
  await prisma.zohoSyncLog.update({
    where: { id: logId },
    data: {
      status: "PENDING",
      retryCount: 0,
      errorMessage: null,
    },
  })

  return { success: true }
}

export async function retryAllFailedSyncs(entityType?: ZohoEntityType) {
  await requireAdmin()

  const where = {
    status: "FAILED" as ZohoSyncStatus,
    ...(entityType && { entityType }),
  }

  const result = await prisma.zohoSyncLog.updateMany({
    where,
    data: {
      status: "PENDING",
      retryCount: 0,
      errorMessage: null,
    },
  })

  return { success: true, count: result.count }
}

export async function deleteFailedSync(logId: string) {
  await requireAdmin()

  await prisma.zohoSyncLog.delete({
    where: { id: logId },
  })

  return { success: true }
}

export async function clearAllFailedSyncs(entityType?: ZohoEntityType) {
  await requireAdmin()

  const where = {
    status: "FAILED" as ZohoSyncStatus,
    ...(entityType && { entityType }),
  }

  const result = await prisma.zohoSyncLog.deleteMany({ where })

  return { success: true, count: result.count }
}

export async function syncAllExistingProducts() {
  await requireAdmin()

  // Get all products that haven't been synced yet or failed
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { zohoItemId: null },
        { zohoSyncStatus: "failed" },
      ],
    },
    select: { id: true, name: true },
  })

  if (products.length === 0) {
    return {
      success: true,
      message: "All products are already synced",
      count: 0,
    }
  }

  // Queue all products for sync
  const productIds = products.map(p => p.id)
  
  // Create sync log entries for all products
  const syncLogs = await prisma.zohoSyncLog.createMany({
    data: productIds.map(id => ({
      entityType: "product",
      entityId: id,
      action: "create",
      status: "pending",
      priority: 1, // High priority for bulk sync
    })),
    skipDuplicates: true, // Skip if already queued
  })

  return {
    success: true,
    message: `Queued ${products.length} products for sync`,
    count: products.length,
    productNames: products.slice(0, 5).map(p => p.name), // First 5 for preview
  }
}

export async function syncAllExistingCustomers() {
  await requireAdmin()

  // Get all customers that haven't been synced yet
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      OR: [
        { zohoContactId: null },
        { zohoSyncStatus: "failed" },
      ],
    },
    select: { id: true, name: true, email: true },
  })

  if (customers.length === 0) {
    return {
      success: true,
      message: "All customers are already synced",
      count: 0,
    }
  }

  // Queue all customers for sync
  const customerIds = customers.map(c => c.id)
  
  await prisma.zohoSyncLog.createMany({
    data: customerIds.map(id => ({
      entityType: "customer",
      entityId: id,
      action: "create",
      status: "pending",
      priority: 2,
    })),
    skipDuplicates: true,
  })

  return {
    success: true,
    message: `Queued ${customers.length} customers for sync`,
    count: customers.length,
  }
}

export async function syncAllExistingOrders() {
  await requireAdmin()

  // Get all completed orders that haven't been synced yet
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PROCESSING", "SHIPPED", "DELIVERED"],
      },
      OR: [
        { zohoSalesOrderId: null },
        { zohoSyncStatus: "failed" },
      ],
    },
    select: { id: true, orderNumber: true },
  })

  if (orders.length === 0) {
    return {
      success: true,
      message: "All orders are already synced",
      count: 0,
    }
  }

  // Queue all orders for sync
  const orderIds = orders.map(o => o.id)
  
  await prisma.zohoSyncLog.createMany({
    data: orderIds.map(id => ({
      entityType: "order",
      entityId: id,
      action: "create",
      status: "pending",
      priority: 3,
    })),
    skipDuplicates: true,
  })

  return {
    success: true,
    message: `Queued ${orders.length} orders for sync`,
    count: orders.length,
  }
}

export async function getZohoConnectionStatus() {
  await requireAdmin()

  const token = await prisma.zohoToken.findFirst({
    orderBy: { createdAt: "desc" },
  })

  if (!token) {
    return {
      connected: false,
      message: "No Zoho connection found. Please authenticate.",
    }
  }

  const now = new Date()
  const isExpired = token.expiresAt < now

  return {
    connected: !isExpired,
    expiresAt: token.expiresAt,
    message: isExpired
      ? "Zoho token expired. Please re-authenticate."
      : "Connected to Zoho Books",
  }
}

