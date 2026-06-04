// Payment integration utilities for PayPal and Tuma (M-Pesa STK push)

export interface PaymentConfig {
  paypal: {
    clientId: string
    clientSecret: string
    mode: 'sandbox' | 'live'
  }
  tuma: {
    email: string
    apiKey: string
    baseUrl: string
  }
}

export interface PaymentBillingAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  countryCode?: string
}

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  description: string
  returnUrl: string
  cancelUrl: string
  billingAddress?: PaymentBillingAddress
  metadata?: Record<string, string | number>
}

export interface PaymentResponse {
  success: boolean
  paymentId?: string
  redirectUrl?: string
  error?: string
  transactionId?: string
  /** Customer-facing message from the payment gateway (e.g. STK push sent). */
  message?: string
  merchantRequestId?: string
  checkoutRequestId?: string
}

export interface PaymentVerification {
  success: boolean
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  transactionId?: string
  amount?: number
  currency?: string
  error?: string
}

export interface PaymentVerificationOptions {
  payerId?: string
  merchantReference?: string
}

// PayPal Integration
export class PayPalPayment {
  private config: PaymentConfig['paypal']
  private tokenCache?: { token: string; expiresAt: number }

  constructor(config: PaymentConfig['paypal']) {
    this.config = config
  }

  private getBaseUrl() {
    return this.config.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.tokenCache && now < this.tokenCache.expiresAt - 60_000) {
      return this.tokenCache.token
    }

    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
    const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error(`PayPal Auth failed: ${response.statusText}`)
    }

    const data = await response.json()
    this.tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in * 1000)
    }
    return data.access_token
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: request.orderId,
            amount: {
              currency_code: request.currency,
              value: request.amount.toFixed(2)
            },
            description: request.description
          }],
          application_context: {
            return_url: request.returnUrl,
            cancel_url: request.cancelUrl,
            user_action: 'PAY_NOW'
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create PayPal order')
      }

      const order = await response.json()
      const approveLink = order.links.find((l: any) => l.rel === 'approve')

      return {
        success: true,
        paymentId: order.id,
        redirectUrl: approveLink?.href
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayPal payment creation failed'
      }
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    try {
      const token = await this.getAccessToken()
      const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        // If already captured, we should check status
        if (error.name === 'ORDER_ALREADY_CAPTURED') {
          return this.getOrderStatus(paymentId, token)
        }
        throw new Error(error.message || 'Failed to capture PayPal payment')
      }

      const capture = await response.json()
      const isCompleted = capture.status === 'COMPLETED'

      return {
        success: isCompleted,
        status: isCompleted ? 'completed' : 'pending',
        transactionId: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        amount: Number(capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value),
        currency: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'PayPal payment verification failed'
      }
    }
  }

  private async getOrderStatus(paymentId: string, token: string): Promise<PaymentVerification> {
    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const order = await response.json()
    const isCompleted = order.status === 'COMPLETED' || order.status === 'APPROVED'

    return {
      success: isCompleted,
      status: isCompleted ? 'completed' : 'pending',
      transactionId: order.purchase_units?.[0]?.payments?.captures?.[0]?.id || order.id
    }
  }
}

/** Tuma returns the JWT at `data.token` (not top-level `token`). */
function extractTumaAuthToken(raw: Record<string, unknown>): string | undefined {
  if (typeof raw.token === 'string' && raw.token.trim()) {
    return raw.token.trim()
  }
  if (typeof raw.access_token === 'string' && raw.access_token.trim()) {
    return raw.access_token.trim()
  }
  const data = raw.data
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>
    if (typeof nested.token === 'string' && nested.token.trim()) {
      return nested.token.trim()
    }
    if (typeof nested.access_token === 'string' && nested.access_token.trim()) {
      return nested.access_token.trim()
    }
  }
  return undefined
}

/** Normalize Kenyan mobile numbers to 254XXXXXXXXX for Tuma/M-Pesa. */
export function normalizeKenyaPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('254') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`
  if (digits.length === 9 && /^[17]/.test(digits)) return `254${digits}`
  return null
}

// Tuma Integration (M-Pesa STK push)
export class TumaPayment {
  private config: PaymentConfig['tuma']
  private tokenCache?: { token: string; expiresAt: number }

  constructor(config: PaymentConfig['tuma']) {
    this.config = config
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      this.assertConfig()
      const phone = request.customerPhone ? normalizeKenyaPhone(request.customerPhone) : null
      if (!phone) {
        throw new Error('A valid Kenyan M-Pesa phone number is required (e.g. 0712345678 or 254712345678)')
      }

      const token = await this.getAccessToken()
      const response = await this.authenticatedRequest<Record<string, unknown>>('/payment/stk-push', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(request.amount.toFixed(2)),
          phone,
          callback_url: request.returnUrl,
          description: (request.description || `Order ${request.orderId}`).slice(0, 100)
        })
      })

      if (response.success === false) {
        const message = typeof response.message === 'string' ? response.message : 'Tuma STK push failed'
        throw new Error(message)
      }

      if (process.env.NODE_ENV === 'development') {
        console.info('[tuma/stk-push] response:', JSON.stringify(response))
      }

      const data = (response.data && typeof response.data === 'object'
        ? response.data
        : response && typeof response === 'object' && 'checkout_request_id' in response
          ? response
          : {}) as Record<string, unknown>

      const merchantRequestId =
        typeof data.merchant_request_id === 'string' ? data.merchant_request_id : undefined
      const checkoutRequestId =
        typeof data.checkout_request_id === 'string' ? data.checkout_request_id : undefined

      if (!checkoutRequestId) {
        throw new Error('Tuma did not return a checkout request id')
      }

      const message =
        typeof response.message === 'string'
          ? response.message
          : typeof data.customer_message === 'string'
            ? data.customer_message
            : 'Payment request sent. Complete payment on your phone.'

      return {
        success: true,
        paymentId: checkoutRequestId,
        transactionId: checkoutRequestId,
        merchantRequestId,
        checkoutRequestId,
        message
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tuma payment creation failed'
      }
    }
  }

  async verifyPayment(): Promise<PaymentVerification> {
    // Tuma confirms payments via webhook callback; there is no status poll endpoint in the API.
    return {
      success: false,
      status: 'pending',
      error: 'Tuma payment status is updated via callback only'
    }
  }

  private assertConfig() {
    const missing: string[] = []
    if (!this.config.email?.trim()) missing.push('TUMA_API_EMAIL')
    if (!this.config.apiKey?.trim()) missing.push('TUMA_API_KEY')
    if (!this.config.baseUrl?.trim()) missing.push('TUMA_API_BASE_URL')
    if (missing.length) {
      throw new Error(`Missing Tuma configuration: ${missing.join(', ')}`)
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.tokenCache && now < this.tokenCache.expiresAt - 60_000) {
      return this.tokenCache.token
    }

    const response = await fetch(`${this.config.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        email: this.config.email,
        api_key: this.config.apiKey
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(`Unable to authenticate with Tuma: ${message}`)
    }

    const raw = (await response.json()) as Record<string, unknown>
    if (raw.success === false) {
      throw new Error(typeof raw.message === 'string' ? raw.message : 'Tuma authentication failed')
    }

    const token = extractTumaAuthToken(raw)
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[tuma/auth] Unexpected auth response shape:', JSON.stringify(raw))
      }
      const hint =
        typeof raw.message === 'string' && raw.message.trim()
          ? raw.message
          : 'Tuma authentication response did not include a token'
      throw new Error(hint)
    }

    const data = raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw
    const expiresIn =
      (typeof raw.expires_in === 'number' && Number.isFinite(raw.expires_in) ? raw.expires_in : undefined) ??
      (typeof data.expires_in === 'number' && Number.isFinite(data.expires_in) ? data.expires_in : undefined) ??
      86_400
    this.tokenCache = { token, expiresAt: now + expiresIn * 1000 }
    return token
  }

  private async authenticatedRequest<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}${path}`
    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
    const response = await fetch(url, { ...init, headers })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message =
        body && typeof body === 'object' && 'message' in body && typeof (body as { message: unknown }).message === 'string'
          ? (body as { message: string }).message
          : response.statusText
      throw new Error(`Tuma request failed: ${message || response.status}`)
    }

    return body as T
  }
}

// Main Payment Service
export class PaymentService {
  private paypal: PayPalPayment
  private tuma: TumaPayment

  constructor(config: PaymentConfig) {
    this.paypal = new PayPalPayment(config.paypal)
    this.tuma = new TumaPayment(config.tuma)
  }

  async createPayment(method: 'paypal' | 'tuma', request: PaymentRequest): Promise<PaymentResponse> {
    switch (method) {
      case 'paypal':
        return this.paypal.createPayment(request)
      case 'tuma':
        return this.tuma.createPayment(request)
      default:
        throw new Error('Unsupported payment method')
    }
  }

  async verifyPayment(method: 'paypal' | 'tuma', paymentId: string, additionalData?: PaymentVerificationOptions): Promise<PaymentVerification> {
    switch (method) {
      case 'paypal':
        return this.paypal.verifyPayment(paymentId)
      case 'tuma':
        return this.tuma.verifyPayment()
      default:
        throw new Error('Unsupported payment method')
    }
  }
}

// Utility functions
export function getPaymentConfig(): PaymentConfig {
  return {
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox'
    },
    tuma: {
      email: process.env.TUMA_API_EMAIL || '',
      apiKey: process.env.TUMA_API_KEY || '',
      baseUrl: process.env.TUMA_API_BASE_URL || 'https://api.tuma.co.ke'
    }
  }
}

// React hook for payment processing
export function usePayment() {
  const config = getPaymentConfig()
  const paymentService = new PaymentService(config)

  const processPayment = async (
    method: 'paypal' | 'tuma',
    request: PaymentRequest
  ): Promise<PaymentResponse> => {
    return paymentService.createPayment(method, request)
  }

  const verifyPayment = async (
    method: 'paypal' | 'tuma',
    paymentId: string,
    additionalData?: PaymentVerificationOptions
  ): Promise<PaymentVerification> => {
    return paymentService.verifyPayment(method, paymentId, additionalData)
  }

  return {
    processPayment,
    verifyPayment
  }
}
