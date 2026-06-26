/**
 * Zoho OAuth Initiation Route
 * Redirects to Zoho authorization page
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { zohoClient } from '@/lib/zoho'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      )
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }
    
    // Generate state parameter with user ID for validation on callback
    // Format: userId:randomString:timestamp
    const randomString = crypto.randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const state = `${session.user.id}:${randomString}:${timestamp}`
    
    // Encode state to base64 for URL safety
    const encodedState = Buffer.from(state).toString('base64url')

    // Get authorization URL
    const authUrl = zohoClient.getAuthorizationUrl(encodedState)

    // Redirect to Zoho authorization page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[Zoho Auth] OAuth initiation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

