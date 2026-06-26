/**
 * Zoho Debug Endpoint
 * Tests Zoho API configuration and connectivity
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Collect debug information
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID ? `${process.env.ZOHO_CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
        ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
        ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI || 'NOT SET',
        ZOHO_ORGANIZATION_ID: process.env.ZOHO_ORGANIZATION_ID || 'NOT SET',
        ZOHO_API_DOMAIN: process.env.ZOHO_API_DOMAIN || 'NOT SET (using default)',
        ZOHO_ACCOUNTS_DOMAIN: process.env.ZOHO_ACCOUNTS_DOMAIN || 'NOT SET (using default)',
        ZOHO_DATA_CENTER: process.env.ZOHO_DATA_CENTER || 'NOT SET',
        ZOHO_SYNC_ENABLED: process.env.ZOHO_SYNC_ENABLED || 'NOT SET',
      },
      database: {
        tokenExists: false,
        tokenExpired: false,
        tokenExpiresAt: null,
        pendingItems: 0,
        failedItems: 0,
      },
      apiTest: {
        endpoint: '',
        status: 'not tested',
        error: null,
      }
    }

    // Check database token
    const token = await prisma.zohoToken.findUnique({
      where: { id: 'singleton' }
    })

    if (token) {
      debug.database.tokenExists = true
      debug.database.tokenExpired = token.expiresAt < new Date()
      debug.database.tokenExpiresAt = token.expiresAt.toISOString()
    }

    // Check pending/failed items
    const [pending, failed] = await Promise.all([
      prisma.zohoSyncLog.count({ where: { status: 'pending' } }),
      prisma.zohoSyncLog.count({ where: { status: 'failed' } }),
    ])

    debug.database.pendingItems = pending
    debug.database.failedItems = failed

    // Test API connectivity
    if (token && !debug.database.tokenExpired) {
      const apiBase = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com/books/v3'
      const orgId = process.env.ZOHO_ORGANIZATION_ID
      const testEndpoint = `${apiBase}/items?organization_id=${orgId}&per_page=1`
      
      debug.apiTest.endpoint = testEndpoint

      try {
        const response = await fetch(testEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        debug.apiTest.status = response.status.toString()

        if (!response.ok) {
          const text = await response.text()
          debug.apiTest.error = text.substring(0, 500) // First 500 chars
        } else {
          const data = await response.json()
          debug.apiTest.status = `${response.status} OK - ${data.items?.length || 0} items found`
        }
      } catch (error) {
        debug.apiTest.error = error instanceof Error ? error.message : 'Unknown error'
      }
    } else {
      debug.apiTest.status = 'skipped (no valid token)'
    }

    return NextResponse.json(debug, { status: 200 })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Made with Bob
