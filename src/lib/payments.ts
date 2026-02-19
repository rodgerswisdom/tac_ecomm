// Payment integration utilities for PayPal and Pesapal

export interface PaymentConfig {
  paypal: {
    clientId: string
    clientSecret: string
    mode: 'sandbox' | 'live'
  }
  pesapal: {
    consumerKey: string
    consumerSecret: string
    environment: 'sandbox' | 'production'
    notificationId?: string
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

  constructor(config: PaymentConfig['paypal']) {
    this.config = config
  }

  async createPayment(_request: PaymentRequest): Promise<PaymentResponse> {
    void _request
    try {
      // TODO: Replace with real PayPal API integration
      // Example: Use fetch or axios to call PayPal REST API
      throw new Error('PayPal integration not implemented. Please integrate with PayPal REST API.');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  async verifyPayment(_paymentId: string, _payerId?: string): Promise<PaymentVerification> {
    void _paymentId
    void _payerId
    try {
      // TODO: Replace with real PayPal payment verification
      throw new Error('PayPal payment verification not implemented. Please integrate with PayPal REST API.');
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }
}

// Pesapal Integration
export class PesapalPayment {
  private config: PaymentConfig['pesapal']
  private tokenCache?: { token: string; expiresAt: number }

  constructor(config: PaymentConfig['pesapal']) {
    this.config = config
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      this.assertConfig()
      const token = await this.getAccessToken()
      const [firstName, ...rest] = request.customerName.trim().split(' ')
      const lastName = rest.join(' ') || firstName
      const notificationId = this.resolveNotificationId()
      const payload = {
        id: request.orderId,
        currency: request.currency,
        amount: Number(request.amount.toFixed(2)),
        description: request.description,
        callback_url: request.returnUrl,
        ...(notificationId ? { notification_id: notificationId } : {}),
        billing_address: {
          email_address: request.customerEmail,
          phone_number: request.customerPhone ?? '',
          country_code: request.billingAddress?.countryCode ?? '',
          first_name: firstName,
          middle_name: '',
          last_name: lastName,
          line_1: request.billingAddress?.line1 ?? '',
          line_2: request.billingAddress?.line2 ?? '',
          city: request.billingAddress?.city ?? '',
          state: request.billingAddress?.state ?? '',
          zip_code: request.billingAddress?.postalCode ?? ''
        },
      }

      const response = await this.authenticatedRequest<Record<string, unknown>>(
        '/Transactions/SubmitOrderRequest',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      const { orderTrackingId, redirectUrl, statusMessage } = this.normalizeOrderResponse(response)
      if (!orderTrackingId || !redirectUrl) {
        throw new Error(statusMessage || 'Pesapal did not return a redirect URL')
      }

      return {
        success: true,
        paymentId: orderTrackingId,
        redirectUrl
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pesapal payment creation failed'
      }
    }
  }

  async verifyPayment(orderTrackingId: string, options?: { merchantReference?: string }): Promise<PaymentVerification> {
    try {
      this.assertConfig()
      const token = await this.getAccessToken()
      const params = new URLSearchParams({ orderTrackingId })
      if (options?.merchantReference) {
        params.set('merchantReference', options.merchantReference)
      }
      const response = await this.authenticatedRequest<Record<string, unknown>>(`/Transactions/GetTransactionStatus?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const statusInfo = this.normalizeStatusResponse(response)

      return {
        success: statusInfo.status === 'completed',
        status: statusInfo.status,
        transactionId: statusInfo.transactionId,
        amount: statusInfo.amount,
        currency: statusInfo.currency,
        error: statusInfo.error
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  private assertConfig() {
    const missing: string[] = []
    if (!this.config.consumerKey?.trim()) missing.push('PESAPAL_CONSUMER_KEY')
    if (!this.config.consumerSecret?.trim()) missing.push('PESAPAL_CONSUMER_SECRET')
    if (!this.config.environment?.trim()) missing.push('PESAPAL_ENVIRONMENT')
    if (missing.length) {
      throw new Error(`Missing Pesapal configuration: ${missing.join(', ')}`)
    }
  }

  private resolveNotificationId(): string | undefined {
    const value = this.config.notificationId?.trim()
    if (!value) return undefined
    if (value.startsWith('http')) {
      console.warn('PESAPAL_NOTIFICATION_ID should be the Pesapal IPN ID, not the URL. Ignoring URL value.')
      return undefined
    }
    return value
  }

  private normalizeOrderResponse(raw: Record<string, unknown>) {
    const redirectUrl =
      this.getNestedString(raw, ['redirect_url']) ??
      this.getNestedString(raw, ['redirectUrl'])
    const orderTrackingId =
      this.getNestedString(raw, ['order_tracking_id']) ??
      this.getNestedString(raw, ['orderTrackingId'])
    const statusMessage = this.getNestedString(raw, ['message'])

    return { redirectUrl, orderTrackingId, statusMessage }
  }

  private normalizeStatusResponse(raw: Record<string, unknown>) {
    const gatewayStatus = (this.getNestedString(raw, ['payment_status']) ?? this.getNestedString(raw, ['status']) ?? 'PENDING').toUpperCase()
    const statusCode = this.getNestedNumber(raw, ['status_code'])

    const statusMap: Record<string, PaymentVerification['status']> = {
      COMPLETED: 'completed',
      PAID: 'completed',
      AUTHORIZED: 'completed',
      PROCESSING: 'pending',
      PENDING: 'pending',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      INVALID: 'failed',
      REVERSED: 'failed'
    }

    const statusFromCode = this.mapStatusCode(statusCode)
    const status = statusFromCode ?? statusMap[gatewayStatus] ?? 'pending'

    const transactionId =
      this.getNestedString(raw, ['confirmation_code']) ??
      this.getNestedString(raw, ['payment_method']) ??
      this.getNestedString(raw, ['reference'])

    const amount = this.getNestedNumber(raw, ['amount'])
    const currency = this.getNestedString(raw, ['currency'])
    const error = status === 'failed' ? (this.getNestedString(raw, ['status_description']) ?? this.getNestedString(raw, ['payment_status_description'])) : undefined

    return { status, transactionId, amount, currency, error }
  }

  private mapStatusCode(code?: number): PaymentVerification['status'] | undefined {
    if (code === undefined || code === null) return undefined
    switch (code) {
      case 1:
        return 'completed'
      case 0:
        return 'pending'
      case 2:
        return 'failed'
      case 3:
        return 'failed'
      default:
        return undefined
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.tokenCache && now < this.tokenCache.expiresAt - 60_000) {
      return this.tokenCache.token
    }

    const response = await fetch(`${this.getBaseUrl()}/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(`Unable to authenticate with Pesapal: ${message}`)
    }

    const raw = await response.json()
    const token = this.extractTokenValue(raw)
    if (!token) {
      const errorMessage = this.extractErrorMessage(raw)
      if (errorMessage) {
        throw new Error(`Pesapal authentication failed: ${errorMessage}`)
      }
      throw new Error('Pesapal authentication response did not include a token')
    }

    const expiresAt = this.resolveExpiry(raw, now)
    this.tokenCache = { token, expiresAt }
    return token
  }

  private getBaseUrl() {
    return this.config.environment === 'sandbox'
      ? 'https://cybqa.pesapal.com/pesapalv3/api'
      : 'https://pay.pesapal.com/v3/api'
  }

  private extractTokenValue(raw: unknown): string | undefined {
    if (!raw || typeof raw !== 'object') return undefined
    const data = raw as Record<string, unknown>
    return (
      this.getNestedString(data, ['token']) ??
      this.getNestedString(data, ['access_token']) ??
      this.getNestedString(data, ['accessToken']) ??
      this.getNestedString(data, ['data', 'token']) ??
      this.getNestedString(data, ['payload', 'token']) ??
      this.getNestedString(data, ['response_data', 'token'])
    )
  }

  private resolveExpiry(raw: unknown, fallbackStart: number): number {
    if (raw && typeof raw === 'object') {
      const data = raw as Record<string, unknown>
      const iso =
        this.getNestedString(data, ['expiry']) ??
        this.getNestedString(data, ['expiryDate']) ??
        this.getNestedString(data, ['expires_at']) ??
        this.getNestedString(data, ['data', 'expiry']) ??
        this.getNestedString(data, ['data', 'expiryDate'])

      if (iso) {
        const parsed = Date.parse(iso)
        if (!Number.isNaN(parsed)) {
          return parsed
        }
      }

      const expiresInSeconds =
        this.getNestedNumber(data, ['expires_in']) ??
        this.getNestedNumber(data, ['expiresIn'])

      if (typeof expiresInSeconds === 'number') {
        return fallbackStart + expiresInSeconds * 1000
      }
    }

    return fallbackStart + 50 * 60 * 1000
  }

  private getNestedString(source: Record<string, unknown>, path: string[]): string | undefined {
    const value = this.getNestedValue(source, path)
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined
  }

  private getNestedNumber(source: Record<string, unknown>, path: string[]): number | undefined {
    const value = this.getNestedValue(source, path)
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined
  }

  private getNestedValue(source: Record<string, unknown>, path: string[]): unknown {
    let current: unknown = source
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return undefined
      }
      current = (current as Record<string, unknown>)[key]
    }
    return current
  }

  private extractErrorMessage(raw: unknown): string | undefined {
    if (!raw || typeof raw !== 'object') return undefined
    const data = raw as Record<string, unknown>
    const directError = this.getNestedString(data, ['error'])
    if (directError) return directError
    const nestedMessage =
      this.getNestedString(data, ['error', 'message']) ??
      this.getNestedString(data, ['errors', 'message']) ??
      this.getNestedString(data, ['payload', 'error', 'message']) ??
      this.getNestedString(data, ['statusDescription']) ??
      this.getNestedString(data, ['status_description']) ??
      this.getNestedString(data, ['message'])
    if (nestedMessage) {
      const code =
        this.getNestedString(data, ['error', 'code']) ??
        this.getNestedString(data, ['payload', 'error', 'code'])
      return code ? `${nestedMessage} (${code})` : nestedMessage
    }
    const status = this.getNestedString(data, ['status'])
    if (status) return status
    return undefined
  }

  private async authenticatedRequest<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.getBaseUrl()}${path}`
    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
    const response = await fetch(url, { ...init, headers })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(`Pesapal request failed: ${message || response.status}`)
    }

    return (await response.json()) as T
  }
}

// Main Payment Service
export class PaymentService {
  private paypal: PayPalPayment
  private pesapal: PesapalPayment

  constructor(config: PaymentConfig) {
    this.paypal = new PayPalPayment(config.paypal)
    this.pesapal = new PesapalPayment(config.pesapal)
  }

  async createPayment(method: 'paypal' | 'pesapal', request: PaymentRequest): Promise<PaymentResponse> {
    switch (method) {
      case 'paypal':
        return this.paypal.createPayment(request)
      case 'pesapal':
        return this.pesapal.createPayment(request)
      default:
        throw new Error('Unsupported payment method')
    }
  }

  async verifyPayment(method: 'paypal' | 'pesapal', paymentId: string, additionalData?: PaymentVerificationOptions): Promise<PaymentVerification> {
    switch (method) {
      case 'paypal':
        return this.paypal.verifyPayment(paymentId, additionalData?.payerId)
      case 'pesapal':
        return this.pesapal.verifyPayment(paymentId, { merchantReference: additionalData?.merchantReference })
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
    pesapal: {
      consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
      environment: (process.env.PESAPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      notificationId: process.env.PESAPAL_NOTIFICATION_ID
    }
  }
}

// React hook for payment processing
export function usePayment() {
  const config = getPaymentConfig()
  const paymentService = new PaymentService(config)

  const processPayment = async (
    method: 'paypal' | 'pesapal',
    request: PaymentRequest
  ): Promise<PaymentResponse> => {
    return paymentService.createPayment(method, request)
  }

  const verifyPayment = async (
    method: 'paypal' | 'pesapal',
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
