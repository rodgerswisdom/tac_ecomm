import { NextResponse } from "next/server"
import { getSyncMetrics } from "@/lib/zoho/monitoring"

export const dynamic = "force-dynamic"

/**
 * GET /api/zoho/metrics?timeRange=1h|24h|7d
 * Get sync metrics for monitoring
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get("timeRange") || "24h") as "1h" | "24h" | "7d"

    if (!["1h", "24h", "7d"].includes(timeRange)) {
      return NextResponse.json(
        { error: "Invalid timeRange. Must be 1h, 24h, or 7d" },
        { status: 400 }
      )
    }

    const metrics = await getSyncMetrics(timeRange)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Failed to get metrics:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

