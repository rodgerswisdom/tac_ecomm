/**
 * Zoho OAuth Initiation Route
 * Redirects to Zoho authorization page
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { zohoClient } from '@/lib/zoho'

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

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(7)

    // Get authorization URL
    const authUrl = zohoClient.getAuthorizationUrl(state)

    // Redirect to Zoho authorization page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

