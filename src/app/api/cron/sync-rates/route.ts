import { syncExchangeRates } from "@/server/admin/cron-rates"
import { NextRequest, NextResponse } from "next/server"

// Vercel Cron Job Route
// Documentation: https://vercel.com/docs/cron-jobs
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const CRON_SECRET = process.env.CRON_SECRET;

    // 1. Basic security check (if secret is configured)
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 2. Execute sync
    try {
        const result = await syncExchangeRates();

        if (result.success) {
            return NextResponse.json({
                message: 'Rates synced successfully',
                rates: result.rates
            });
        } else {
            return NextResponse.json({
                message: result.message || 'Sync failed internally'
            }, { status: 422 });
        }
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
