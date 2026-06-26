/**
 * Zoho Stock Sync (Vercel Cron Job)
 * Runs hourly to sync stock levels from Zoho Books
 * 
 * Schedule: every hour
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { batchSyncStock } from '@/lib/zoho'

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

    console.log('[Zoho Stock Sync] Starting stock synchronization...')

    // Get all products that are synced to Zoho
    const products = await prisma.product.findMany({
      where: {
        zohoItemId: { not: null },
        isActive: true,
      },
      select: { id: true, name: true, stock: true },
      take: 50, // Limit to 50 products per run to avoid timeout
    })

    if (products.length === 0) {
      console.log('[Zoho Stock Sync] No products to sync')
      return NextResponse.json({
        success: true,
        message: 'No products to sync',
        synced: 0,
      })
    }

    console.log(`[Zoho Stock Sync] Syncing ${products.length} products...`)

    // Batch sync stock
    await batchSyncStock(products.map(p => p.id))

    console.log('[Zoho Stock Sync] Stock synchronization complete')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      synced: products.length,
    })
  } catch (error) {
    console.error('[Zoho Stock Sync] Error syncing stock:', error)
    
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

