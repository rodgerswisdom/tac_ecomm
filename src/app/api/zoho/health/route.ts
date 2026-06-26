import { NextResponse } from "next/server"
import { performHealthCheck } from "@/lib/zoho/monitoring"

export const dynamic = "force-dynamic"

/**
 * GET /api/zoho/health
 * Health check endpoint for Zoho integration
 * Returns comprehensive health status and alerts
 */
export async function GET() {
  try {
    const healthCheck = await performHealthCheck()

    return NextResponse.json(healthCheck, {
      status: healthCheck.healthy ? 200 : 503,
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

