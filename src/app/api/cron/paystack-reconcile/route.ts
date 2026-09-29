import { NextRequest, NextResponse } from "next/server"
import { reconcileAndExpirePaystackOrders } from "@/lib/paystack"

// Vercel Cron (daily on the Hobby plan). It is safe to also call this more often from an
// external scheduler with `Authorization: Bearer $CRON_SECRET` to catch missed webhooks sooner.
export async function GET(request: NextRequest) {
    const CRON_SECRET = process.env.CRON_SECRET
    // This job changes orders, so it must never run unauthenticated in production.
    if (!CRON_SECRET && process.env.NODE_ENV === "production") {
        return new Response("CRON_SECRET is not configured", { status: 500 })
    }
    if (CRON_SECRET && request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const result = await reconcileAndExpirePaystackOrders()
        console.info("[cron/paystack-reconcile]", result)
        return NextResponse.json(result)
    } catch (error) {
        console.error("[cron/paystack-reconcile] failed:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
