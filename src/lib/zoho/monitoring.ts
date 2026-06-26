/**
 * Zoho Integration Monitoring and Error Handling
 * Provides logging, alerting, and health check capabilities
 */

import { prisma } from "@/lib/prisma"

// Type definitions matching the schema
type ZohoSyncStatus = "PENDING" | "SYNCED" | "FAILED" | "RETRYING"
type ZohoEntityType = "PRODUCT" | "CUSTOMER" | "ORDER" | "INVOICE" | "PAYMENT"

export type AlertSeverity = "info" | "warning" | "error" | "critical"

export interface ZohoAlert {
  severity: AlertSeverity
  title: string
  message: string
  entityType?: ZohoEntityType
  entityId?: string
  error?: string
  timestamp: Date
}

export interface HealthCheckResult {
  healthy: boolean
  checks: {
    database: boolean
    zohoConnection: boolean
    queueProcessing: boolean
    recentErrors: boolean
  }
  details: {
    pendingCount: number
    failedCount: number
    retryingCount: number
    recentErrorRate: number
    oldestPendingAge?: number
  }
  alerts: ZohoAlert[]
}

/**
 * Log a Zoho integration event
 */
export async function logZohoEvent(
  level: "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata,
    source: "zoho-integration",
  }

  // Log to console (will be captured by Vercel logs)
  if (level === "error") {
    console.error("[Zoho Integration]", message, metadata)
  } else if (level === "warn") {
    console.warn("[Zoho Integration]", message, metadata)
  } else {
    console.log("[Zoho Integration]", message, metadata)
  }

  // Store in audit log if available
  try {
    await prisma.auditLog.create({
      data: {
        action: `zoho_${level}`,
        details: JSON.stringify(logEntry),
        userAgent: "zoho-integration",
      },
    })
  } catch (error) {
    // Fail silently if audit log is not available
    console.error("Failed to write to audit log:", error)
  }
}

/**
 * Check if error rate is above threshold
 */
async function checkErrorRate(): Promise<{ healthy: boolean; rate: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const [totalRecent, failedRecent] = await Promise.all([
    prisma.zohoSyncLog.count({
      where: {
        updatedAt: { gte: oneHourAgo },
        status: { in: ["SYNCED", "FAILED"] },
      },
    }),
    prisma.zohoSyncLog.count({
      where: {
        updatedAt: { gte: oneHourAgo },
        status: "FAILED",
      },
    }),
  ])

  const errorRate = totalRecent > 0 ? (failedRecent / totalRecent) * 100 : 0
  const healthy = errorRate < 20 // Alert if error rate > 20%

  return { healthy, rate: errorRate }
}

/**
 * Check for stale pending syncs
 */
async function checkStalePending(): Promise<{ healthy: boolean; oldestAge?: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const oldestPending = await prisma.zohoSyncLog.findFirst({
    where: {
      status: "PENDING",
      createdAt: { lt: oneHourAgo },
    },
    orderBy: { createdAt: "asc" },
  })

  if (oldestPending) {
    const ageInMinutes = Math.floor(
      (Date.now() - oldestPending.createdAt.getTime()) / (60 * 1000)
    )
    return { healthy: false, oldestAge: ageInMinutes }
  }

  return { healthy: true }
}

/**
 * Check Zoho connection status
 */
async function checkZohoConnection(): Promise<boolean> {
  try {
    const token = await prisma.zohoToken.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!token) return false

    const now = new Date()
    return token.expiresAt > now
  } catch (error) {
    return false
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const alerts: ZohoAlert[] = []

  // Check database connectivity
  let databaseHealthy = true
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    databaseHealthy = false
    alerts.push({
      severity: "critical",
      title: "Database Connection Failed",
      message: "Unable to connect to database",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
    })
  }

  // Check Zoho connection
  const zohoConnected = await checkZohoConnection()
  if (!zohoConnected) {
    alerts.push({
      severity: "error",
      title: "Zoho Connection Lost",
      message: "OAuth token is missing or expired. Re-authentication required.",
      timestamp: new Date(),
    })
  }

  // Get queue statistics
  const [pendingCount, failedCount, retryingCount] = await Promise.all([
    prisma.zohoSyncLog.count({ where: { status: "PENDING" } }),
    prisma.zohoSyncLog.count({ where: { status: "FAILED" } }),
    prisma.zohoSyncLog.count({ where: { status: "RETRYING" } }),
  ])

  // Check error rate
  const { healthy: errorRateHealthy, rate: errorRate } = await checkErrorRate()
  if (!errorRateHealthy) {
    alerts.push({
      severity: "warning",
      title: "High Error Rate Detected",
      message: `Error rate is ${errorRate.toFixed(1)}% in the last hour (threshold: 20%)`,
      timestamp: new Date(),
    })
  }

  // Check for stale pending syncs
  const { healthy: pendingHealthy, oldestAge } = await checkStalePending()
  if (!pendingHealthy && oldestAge) {
    alerts.push({
      severity: "warning",
      title: "Stale Pending Syncs",
      message: `Oldest pending sync is ${oldestAge} minutes old. Queue may be stuck.`,
      timestamp: new Date(),
    })
  }

  // Check for excessive failures
  if (failedCount > 50) {
    alerts.push({
      severity: "error",
      title: "Excessive Failed Syncs",
      message: `${failedCount} failed syncs detected. Manual intervention may be required.`,
      timestamp: new Date(),
    })
  }

  // Check for large pending queue
  if (pendingCount > 100) {
    alerts.push({
      severity: "warning",
      title: "Large Pending Queue",
      message: `${pendingCount} syncs pending. Queue processing may be slow.`,
      timestamp: new Date(),
    })
  }

  const queueProcessing = pendingHealthy && pendingCount < 100
  const recentErrors = errorRateHealthy && failedCount < 50

  const healthy =
    databaseHealthy && zohoConnected && queueProcessing && recentErrors

  return {
    healthy,
    checks: {
      database: databaseHealthy,
      zohoConnection: zohoConnected,
      queueProcessing,
      recentErrors,
    },
    details: {
      pendingCount,
      failedCount,
      retryingCount,
      recentErrorRate: errorRate,
      oldestPendingAge: oldestAge,
    },
    alerts,
  }
}

/**
 * Get sync statistics for monitoring dashboard
 */
export async function getSyncMetrics(timeRange: "1h" | "24h" | "7d" = "24h") {
  const now = new Date()
  const startTime = new Date(
    now.getTime() -
      (timeRange === "1h" ? 60 * 60 * 1000 : timeRange === "24h" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)
  )

  const logs = await prisma.zohoSyncLog.findMany({
    where: {
      updatedAt: { gte: startTime },
    },
    select: {
      status: true,
      entityType: true,
      updatedAt: true,
      attempts: true,
    },
  })

  // Calculate metrics
  const totalSyncs = logs.length
  const successfulSyncs = logs.filter((l) => l.status === "SYNCED").length
  const failedSyncs = logs.filter((l) => l.status === "FAILED").length
  const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0

  // Average attempts before success
  const successfulWithAttempts = logs.filter(
    (l) => l.status === "SYNCED" && l.attempts > 0
  )
  const avgAttempts =
    successfulWithAttempts.length > 0
      ? successfulWithAttempts.reduce((sum, l) => sum + l.attempts, 0) /
        successfulWithAttempts.length
      : 0

  // Syncs by entity type
  const byEntityType = logs.reduce((acc, log) => {
    const type = log.entityType
    if (!acc[type]) {
      acc[type] = { total: 0, synced: 0, failed: 0 }
    }
    acc[type].total++
    if (log.status === "SYNCED") acc[type].synced++
    if (log.status === "FAILED") acc[type].failed++
    return acc
  }, {} as Record<string, { total: number; synced: number; failed: number }>)

  return {
    timeRange,
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    successRate,
    avgAttempts,
    byEntityType,
  }
}

/**
 * Send alert notification (placeholder for email/SMS integration)
 */
export async function sendAlert(alert: ZohoAlert) {
  // Log the alert
  await logZohoEvent(
    alert.severity === "critical" || alert.severity === "error" ? "error" : "warn",
    `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`,
    {
      entityType: alert.entityType,
      entityId: alert.entityId,
      error: alert.error,
    }
  )

  // TODO: Integrate with email/SMS service
  // For now, just log to console
  console.log(`🚨 ALERT [${alert.severity}]: ${alert.title}`, alert)

  // In production, you would send emails/SMS here:
  // if (alert.severity === 'critical' || alert.severity === 'error') {
  //   await sendEmail({
  //     to: process.env.ADMIN_EMAIL,
  //     subject: `Zoho Integration Alert: ${alert.title}`,
  //     body: alert.message
  //   })
  // }
}

/**
 * Monitor and alert on sync failures
 */
export async function monitorSyncFailures() {
  const recentFailures = await prisma.zohoSyncLog.findMany({
    where: {
      status: "FAILED",
      updatedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
    },
  })

  if (recentFailures.length > 10) {
    await sendAlert({
      severity: "error",
      title: "Multiple Sync Failures",
      message: `${recentFailures.length} syncs failed in the last 15 minutes`,
      timestamp: new Date(),
    })
  }

  // Check for repeated failures of the same entity
  const failuresByEntity = recentFailures.reduce((acc, failure) => {
    const key = `${failure.entityType}:${failure.entityId}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  for (const [key, count] of Object.entries(failuresByEntity)) {
    if (count >= 3) {
      const [entityType, entityId] = key.split(":")
      await sendAlert({
        severity: "warning",
        title: "Repeated Sync Failure",
        message: `Entity ${entityType} ${entityId} has failed ${count} times`,
        entityType: entityType as ZohoEntityType,
        entityId,
        timestamp: new Date(),
      })
    }
  }
}

