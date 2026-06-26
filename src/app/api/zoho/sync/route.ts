/**
 * Zoho Manual Sync Trigger Route
 * Allows admins to manually trigger syncs
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  queueProductSync,
  queueCustomerSync,
  queueOrderSync,
  queueInvoiceCreation,
  queuePaymentRecording,
  queueCompleteOrderFlow,
  batchQueueProducts,
} from '@/lib/zoho'
import type { EntityType, SyncAction } from '@/lib/zoho'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SyncRequest {
  entityType: EntityType
  entityId?: string
  entityIds?: string[]
  action?: SyncAction
  includeInvoice?: boolean
  includePayment?: boolean
}

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
    const body: SyncRequest = await request.json()
    const { entityType, entityId, entityIds, action = 'create', includeInvoice, includePayment } = body

    // Validate input
    if (!entityType) {
      return NextResponse.json(
        { error: 'entityType is required' },
        { status: 400 }
      )
    }

    if (!entityId && !entityIds) {
      return NextResponse.json(
        { error: 'Either entityId or entityIds is required' },
        { status: 400 }
      )
    }

    let result: unknown

    // Handle batch operations
    if (entityIds && entityIds.length > 0) {
      if (entityType === 'product') {
        const syncIds = await batchQueueProducts(entityIds, action)
        result = {
          queued: true,
          count: syncIds.length,
          syncIds,
        }
      } else {
        return NextResponse.json(
          { error: 'Batch operations only supported for products' },
          { status: 400 }
        )
      }
    }
    // Handle single entity operations
    else if (entityId) {
      switch (entityType) {
        case 'product': {
          const syncId = await queueProductSync(entityId, action)
          result = { queued: true, syncId }
          break
        }

        case 'customer': {
          const syncId = await queueCustomerSync(entityId, action)
          result = { queued: true, syncId }
          break
        }

        case 'order': {
          if (includeInvoice || includePayment) {
            // Queue complete flow
            const paymentId = includePayment ? entityId : undefined
            const flowResult = await queueCompleteOrderFlow(entityId, paymentId)
            result = { queued: true, ...flowResult }
          } else {
            // Queue order only
            const orderResult = await queueOrderSync(entityId)
            result = { queued: true, ...orderResult }
          }
          break
        }

        case 'invoice': {
          const syncId = await queueInvoiceCreation(entityId)
          result = { queued: true, syncId }
          break
        }

        case 'payment': {
          const syncId = await queuePaymentRecording(entityId)
          result = { queued: true, syncId }
          break
        }

        default:
          return NextResponse.json(
            { error: `Unknown entity type: ${entityType}` },
            { status: 400 }
          )
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync trigger error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

