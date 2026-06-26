import { NextResponse } from "next/server"
import { performHealthCheck, monitorSyncFailures, logZohoEvent } from "@/lib/zoho/monitoring"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Cron job: Monitor Zoho integration health
 * Runs every 30 minutes to check system health and alert on issues
 * 
 * Vercel Cron: 0,30 * * * * (every 30 minutes)
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await logZohoEvent("info", "Starting health check monitoring")

    // Perform health check
    const healthCheck = await performHealthCheck()

    // Log health status
    if (!healthCheck.healthy) {
      await logZohoEvent(
        "warn",
        "Health check failed",
        {
          checks: healthCheck.checks,
          details: healthCheck.details,
          alertCount: healthCheck.alerts.length,
        }
      )
    }

    // Monitor for sync failures
    await monitorSyncFailures()

    // Log critical alerts
    for (const alert of healthCheck.alerts) {
      if (alert.severity === "critical" || alert.severity === "error") {
        await logZohoEvent(
          "error",
          `[${alert.severity}] ${alert.title}: ${alert.message}`,
          {
            entityType: alert.entityType,
            entityId: alert.entityId,
            error: alert.error,
          }
        )
      }
    }

    return NextResponse.json({
      success: true,
      healthy: healthCheck.healthy,
      alertCount: healthCheck.alerts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Monitoring cron job failed:", error)
    await logZohoEvent(
      "error",
      "Monitoring cron job failed",
      { error: error instanceof Error ? error.message : String(error) }
    )

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

