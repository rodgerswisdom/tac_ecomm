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
  }
}

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  customerName: string
  description: string
  returnUrl: string
  cancelUrl: string
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

// PayPal Integration
export class PayPalPayment {
  private config: PaymentConfig['paypal']

  constructor(config: PaymentConfig['paypal']) {
    this.config = config
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would call PayPal's API here
      // This is a mock implementation
      const paypalUrl = this.config.mode === 'sandbox' 
        ? 'https://api.sandbox.paypal.com' 
        : 'https://api.paypal.com'

      // Mock PayPal payment creation
      const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        transactions: [{
          amount: {
            total: request.amount.toFixed(2),
            currency: request.currency
          },
          description: request.description,
          custom: request.orderId
        }],
        redirect_urls: {
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl
        }
      }

      // Simulate API call
      const response = await this.simulateApiCall(paypalUrl + '/v1/payments/payment', paymentData)
      
      return {
        success: true,
        paymentId: response.id,
        redirectUrl: response.links.find((link: any) => link.rel === 'approval_url')?.href
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  async verifyPayment(paymentId: string, payerId: string): Promise<PaymentVerification> {
    try {
      // Mock verification
      const verification = await this.simulateApiCall(`/v1/payments/payment/${paymentId}/execute`, {
        payer_id: payerId
      })

      return {
        success: true,
        status: 'completed',
        transactionId: verification.transactions[0].related_resources[0].sale.id,
        amount: parseFloat(verification.transactions[0].amount.total),
        currency: verification.transactions[0].amount.currency
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  private async simulateApiCall(url: string, data: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock response
    return {
      id: 'PAY-' + Math.random().toString(36).substr(2, 9),
      state: 'created',
      links: [
        {
          href: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-' + Math.random().toString(36).substr(2, 9),
          rel: 'approval_url',
          method: 'REDIRECT'
        }
      ],
      transactions: [{
        amount: data.transactions[0].amount,
        description: data.transactions[0].description,
        related_resources: [{
          sale: {
            id: 'SALE-' + Math.random().toString(36).substr(2, 9)
          }
        }]
      }]
    }
  }
}

// Pesapal Integration
export class PesapalPayment {
  private config: PaymentConfig['pesapal']

  constructor(config: PaymentConfig['pesapal']) {
    this.config = config
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const pesapalUrl = this.config.environment === 'sandbox'
        ? 'https://cybqa.pesapal.com'
        : 'https://www.pesapal.com'

      // Get access token
      const token = await this.getAccessToken()
      
      // Create payment request
      const paymentData = {
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        type: 'MERCHANT',
        reference: request.orderId,
        first_name: request.customerName.split(' ')[0],
        last_name: request.customerName.split(' ').slice(1).join(' '),
        email: request.customerEmail,
        phone_number: '',
        callback_url: request.returnUrl,
        cancellation_url: request.cancelUrl
      }

      const response = await this.simulateApiCall(pesapalUrl + '/api/PostPesapalDirectOrderV4', paymentData, token)
      
      return {
        success: true,
        paymentId: response.order_tracking_id,
        redirectUrl: response.redirect_url
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pesapal payment creation failed'
      }
    }
  }

  async verifyPayment(orderTrackingId: string): Promise<PaymentVerification> {
    try {
      const token = await this.getAccessToken()
      const pesapalUrl = this.config.environment === 'sandbox'
        ? 'https://cybqa.pesapal.com'
        : 'https://www.pesapal.com'

      const response = await this.simulateApiCall(
        `${pesapalUrl}/api/QueryPaymentStatus?orderTrackingId=${orderTrackingId}`,
        {},
        token
      )

      const statusMap: Record<string, PaymentVerification['status']> = {
        'COMPLETED': 'completed',
        'PENDING': 'pending',
        'FAILED': 'failed',
        'CANCELLED': 'cancelled'
      }

      return {
        success: response.payment_status === 'COMPLETED',
        status: statusMap[response.payment_status] || 'pending',
        transactionId: response.payment_method,
        amount: response.amount,
        currency: response.currency
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    // Mock token generation
    await new Promise(resolve => setTimeout(resolve, 500))
    return 'TOKEN-' + Math.random().toString(36).substr(2, 9)
  }

  private async simulateApiCall(url: string, data: any, token?: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock response
    if (url.includes('PostPesapalDirectOrderV4')) {
      return {
        order_tracking_id: 'ORDER-' + Math.random().toString(36).substr(2, 9),
        redirect_url: 'https://www.pesapal.com/redirect?token=' + Math.random().toString(36).substr(2, 9)
      }
    } else if (url.includes('QueryPaymentStatus')) {
      return {
        payment_status: 'COMPLETED',
        payment_method: 'M-PESA',
        amount: data.amount || 299,
        currency: data.currency || 'USD'
      }
    }
    
    return {}
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

  async verifyPayment(method: 'paypal' | 'pesapal', paymentId: string, additionalData?: any): Promise<PaymentVerification> {
    switch (method) {
      case 'paypal':
        return this.pesapal.verifyPayment(paymentId)
      case 'pesapal':
        return this.pesapal.verifyPayment(paymentId)
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
      environment: (process.env.PESAPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
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
    additionalData?: any
  ): Promise<PaymentVerification> => {
    return paymentService.verifyPayment(method, paymentId, additionalData)
  }

  return {
    processPayment,
    verifyPayment
  }
}
