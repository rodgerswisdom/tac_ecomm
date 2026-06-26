"use server"

import { requireAdmin } from "./auth"
import { prisma } from "@/lib/prisma"
import type { ZohoSyncStatus, ZohoEntityType } from "@prisma/client"

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

  const where = {
    ...(status && { status }),
    ...(entityType && { entityType }),
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
        ...log,
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

  // Get overall counts
  const [totalSynced, totalPending, totalFailed, totalRetrying] = await Promise.all([
    prisma.zohoSyncLog.count({ where: { status: "SYNCED" } }),
    prisma.zohoSyncLog.count({ where: { status: "PENDING" } }),
    prisma.zohoSyncLog.count({ where: { status: "FAILED" } }),
    prisma.zohoSyncLog.count({ where: { status: "RETRYING" } }),
  ])

  // Get counts by entity type
  const entityTypes: ZohoEntityType[] = ["PRODUCT", "CUSTOMER", "ORDER", "INVOICE", "PAYMENT"]
  const syncsByEntity = await Promise.all(
    entityTypes.map(async (entityType) => {
      const [synced, pending, failed] = await Promise.all([
        prisma.zohoSyncLog.count({ where: { entityType, status: "SYNCED" } }),
        prisma.zohoSyncLog.count({ where: { entityType, status: "PENDING" } }),
        prisma.zohoSyncLog.count({ where: { entityType, status: "FAILED" } }),
      ])
      return { entityType, synced, pending, failed }
    })
  )

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentLogs = await prisma.zohoSyncLog.findMany({
    where: {
      updatedAt: { gte: sevenDaysAgo },
      status: { in: ["SYNCED", "FAILED"] },
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
    if (log.status === "SYNCED") current.synced++
    if (log.status === "FAILED") current.failed++
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
      attempts: 0, // Reset attempts for manual retry
      error: null,
      processedAt: null,
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
      attempts: 0,
      error: null,
      processedAt: null,
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

