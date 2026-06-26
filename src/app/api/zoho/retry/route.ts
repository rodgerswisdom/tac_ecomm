/**
 * Zoho Retry Failed Syncs Route
 * Allows admins to retry failed synchronizations
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { zohoSyncQueue } from '@/lib/zoho'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const limit = body.limit || 10

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Retry failed syncs
    const retriedCount = await zohoSyncQueue.retryFailed(limit)

    return NextResponse.json({
      success: true,
      retriedCount,
      message: `${retriedCount} failed sync(s) queued for retry`,
    })
  } catch (error) {
    console.error('Retry failed syncs error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

