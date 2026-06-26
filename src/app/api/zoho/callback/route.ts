/**
 * Zoho OAuth Callback Route
 * Handles OAuth authorization code exchange
 */

import { NextRequest, NextResponse } from 'next/server'
import { zohoClient } from '@/lib/zoho'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get authorization code from query params
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const encodedState = searchParams.get('state')

    // Check for OAuth errors
    if (error) {
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

    // Validate state parameter
    if (!encodedState) {
      return NextResponse.redirect(
        new URL(
          '/admin/zoho?error=missing_state',
          request.url
        )
      )
    }

    // Decode and parse state
    let userId: string
    try {
      const state = Buffer.from(encodedState, 'base64url').toString('utf-8')
      const [stateUserId, randomString, timestamp] = state.split(':')
      
      // Validate state format
      if (!stateUserId || !randomString || !timestamp) {
        throw new Error('Invalid state format')
      }

      // Check if state is not too old (10 minutes)
      const stateAge = Date.now() - parseInt(timestamp)
      if (stateAge > 10 * 60 * 1000) {
        throw new Error('State expired')
      }

      userId = stateUserId
    } catch (err) {
      return NextResponse.redirect(
        new URL(
          '/admin/zoho?error=invalid_state',
          request.url
        )
      )
    }

    // Verify user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL(
          '/admin/zoho?error=user_not_found',
          request.url
        )
      )
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(
        new URL(
          '/admin/zoho?error=not_admin',
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

