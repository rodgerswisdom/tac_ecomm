/**
 * Zoho Books API Client
 * US Data Center Configuration
 * 
 * Features:
 * - OAuth 2.0 token management with automatic refresh
 * - Rate limiting (100 requests/minute)
 * - Exponential backoff retry logic
 * - Error classification (retryable vs fatal)
 * - Request/response logging
 */

import { prisma } from '@/lib/prisma'

// US Data Center endpoints (fixed)
const ZOHO_API_BASE = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com/books/v3'
const ZOHO_OAUTH_BASE = process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com/oauth/v2'
const ZOHO_ORG_ID = process.env.ZOHO_ORGANIZATION_ID

// Rate limiting configuration
const RATE_LIMIT_PER_MINUTE = 100
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute

// Retry configuration
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000

interface ZohoApiError {
  code: number
  message: string
  isRetryable: boolean
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope?: string
}

class RateLimiter {
  private requests: number[] = []

  canMakeRequest(): boolean {
    const now = Date.now()
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT_WINDOW_MS)
    return this.requests.length < RATE_LIMIT_PER_MINUTE
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  async waitForSlot(): Promise<void> {
    while (!this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    this.recordRequest()
  }
}

export class ZohoClient {
  private rateLimiter = new RateLimiter()
  private accessToken: string | null = null
  private tokenExpiresAt: Date | null = null

  /**
   * Get valid access token (refresh if expired)
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken
    }

    // Try to get token from database
    const tokenRecord = await prisma.zohoToken.findUnique({
      where: { id: 'singleton' }
    })

    if (!tokenRecord) {
      throw new Error('Zoho tokens not initialized. Please complete OAuth flow first.')
    }

    // Check if database token is still valid
    if (tokenRecord.expiresAt > new Date()) {
      this.accessToken = tokenRecord.accessToken
      this.tokenExpiresAt = tokenRecord.expiresAt
      return this.accessToken
    }

    // Token expired, refresh it
    return await this.refreshAccessToken(tokenRecord.refreshToken)
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(`${ZOHO_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh Zoho token: ${error}`)
    }

    const data: TokenResponse = await response.json()

    // Calculate expiration time (subtract 5 minutes for safety)
    const expiresAt = new Date(Date.now() + (data.expires_in - 300) * 1000)

    // Update token in database
    await prisma.zohoToken.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
      },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
      },
    })

    // Update in-memory cache
    this.accessToken = data.access_token
    this.tokenExpiresAt = expiresAt

    return this.accessToken
  }

  /**
   * Store initial tokens after OAuth flow
   */
  async storeTokens(tokens: TokenResponse): Promise<void> {
    const expiresAt = new Date(Date.now() + (tokens.expires_in - 300) * 1000)

    await prisma.zohoToken.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token!,
        expiresAt,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token!,
        expiresAt,
      },
    })

    this.accessToken = tokens.access_token
    this.tokenExpiresAt = expiresAt
  }

  /**
   * Classify error as retryable or fatal
   */
  private classifyError(status: number, errorData: unknown): ZohoApiError {
    const errorObj = (errorData && typeof errorData === 'object' ? errorData : {}) as {
      message?: string
      code?: number
    }
    const message = errorObj.message || 'Unknown error'
    const code = errorObj.code || status

    // Retryable errors
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    const isRetryable = retryableStatuses.includes(status)

    return {
      code,
      message,
      isRetryable,
    }
  }

  /**
   * Make API request with retry logic
   */
  private async requestWithRetry<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    retryCount = 0
  ): Promise<T> {
    try {
      // Wait for rate limit slot
      await this.rateLimiter.waitForSlot()

      // Get valid access token
      const token = await this.getAccessToken()

      // Build URL with organization ID
      const url = `${ZOHO_API_BASE}${endpoint}${
        endpoint.includes('?') ? '&' : '?'
      }organization_id=${ZOHO_ORG_ID}`

      // Make request
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      // Parse response
      const responseData = await response.json()

      // Check for errors
      if (!response.ok) {
        const error = this.classifyError(response.status, responseData)

        // Retry if error is retryable and we haven't exceeded max retries
        if (error.isRetryable && retryCount < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount)
          console.log(`Retrying Zoho API request after ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.requestWithRetry<T>(method, endpoint, data, retryCount + 1)
        }

        throw new Error(`Zoho API Error (${error.code}): ${error.message}`)
      }

      return responseData as T
    } catch (error) {
      // If this is our last retry, throw the error
      if (retryCount >= MAX_RETRIES) {
        throw error
      }

      // For network errors, retry
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount)
      console.log(`Network error, retrying after ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.requestWithRetry<T>(method, endpoint, data, retryCount + 1)
    }
  }

  /**
   * Public API methods
   */

  async get<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>('GET', endpoint)
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.requestWithRetry<T>('POST', endpoint, data)
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.requestWithRetry<T>('PUT', endpoint, data)
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>('DELETE', endpoint)
  }

  /**
   * Check if client is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokenRecord = await prisma.zohoToken.findUnique({
        where: { id: 'singleton' }
      })
      return !!tokenRecord
    } catch {
      return false
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: process.env.ZOHO_CLIENT_ID!,
      response_type: 'code',
      redirect_uri: process.env.ZOHO_REDIRECT_URI!,
      scope: 'ZohoBooks.fullaccess.all',
      access_type: 'offline',
      prompt: 'consent',
    })

    if (state) {
      params.append('state', state)
    }

    return `${ZOHO_OAUTH_BASE}/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const response = await fetch(`${ZOHO_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        redirect_uri: process.env.ZOHO_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for tokens: ${error}`)
    }

    const tokens: TokenResponse = await response.json()
    await this.storeTokens(tokens)
    return tokens
  }
}

// Export singleton instance
export const zohoClient = new ZohoClient()
