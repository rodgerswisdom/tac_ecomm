/**
 * Zoho Sync Queue Processor (Vercel Cron Job)
 * Runs every 15 minutes to process pending syncs
 *
 * Schedule: every 15 minutes
 */

import { NextRequest, NextResponse } from 'next/server'
import { zohoSyncQueue } from '@/lib/zoho'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Zoho sync is enabled
    if (process.env.ZOHO_SYNC_ENABLED !== 'true') {
      return NextResponse.json({
        skipped: true,
        message: 'Zoho sync is disabled',
      })
    }

    console.log('[Zoho Cron] Starting sync queue processing...')

    // Process queue (batch of 10 items)
    const stats = await zohoSyncQueue.processQueue(10)

    console.log('[Zoho Cron] Queue processing complete:', stats)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    })
  } catch (error) {
    console.error('[Zoho Cron] Error processing queue:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

