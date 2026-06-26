/**
 * Zoho Sync Status Route
 * Returns sync status and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { zohoSyncQueue, zohoClient, getEntitySyncStatus, getPendingSyncCount } from '@/lib/zoho'
import { prisma } from '@/lib/prisma'
import type { EntityType } from '@/lib/zoho'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entityType') as EntityType | null
    const entityId = searchParams.get('entityId')

    // If specific entity requested, return its status
    if (entityType && entityId) {
      const status = await getEntitySyncStatus(entityType, entityId)
      return NextResponse.json(status)
    }

    // Otherwise, return overall statistics
    const [queueStats, syncStats, isAuthenticated, recentLogs] = await Promise.all([
      zohoSyncQueue.getQueueStats(),
      prisma.zohoSyncStats.findUnique({ where: { id: 'singleton' } }),
      zohoClient.isAuthenticated(),
      prisma.zohoSyncLog.findMany({
        where: { status: 'failed' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          entityType: true,
          entityId: true,
          action: true,
          errorMessage: true,
          retryCount: true,
          createdAt: true,
        },
      }),
    ])

    // Get pending counts by entity type
    const pendingCounts = {
      products: await getPendingSyncCount('product'),
      customers: await getPendingSyncCount('customer'),
      orders: await getPendingSyncCount('order'),
      invoices: await getPendingSyncCount('invoice'),
      payments: await getPendingSyncCount('payment'),
    }

    return NextResponse.json({
      authenticated: isAuthenticated,
      queue: queueStats,
      stats: syncStats || {
        totalSynced: 0,
        totalFailed: 0,
        lastSyncAt: null,
        lastSuccessAt: null,
        lastFailureAt: null,
        productsSynced: 0,
        ordersSynced: 0,
        paymentsSynced: 0,
        customersSynced: 0,
      },
      pendingCounts,
      recentFailures: recentLogs,
    })
  } catch (error) {
    console.error('Status check error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

