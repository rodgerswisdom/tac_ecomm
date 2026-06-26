/**
 * Zoho OAuth Callback Route
 * Handles OAuth authorization code exchange
 */

import { NextRequest, NextResponse } from 'next/server'
import { zohoClient } from '@/lib/zoho'
import { auth } from '@/lib/auth'

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

    // Get authorization code from query params
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(
        new URL(
          `/admin/zoho?error=${encodeURIComponent(error)}`,
          request.url
        )
      )
    }

    // Validate code
    if (!code) {
      return NextResponse.redirect(
        new URL(
          '/admin/zoho?error=missing_code',
          request.url
        )
      )
    }

    // Exchange code for tokens
    const tokens = await zohoClient.exchangeCodeForTokens(code)

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/admin/zoho?success=true', request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.redirect(
      new URL(
        `/admin/zoho?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    )
  }
}

