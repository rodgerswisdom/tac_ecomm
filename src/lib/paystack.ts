import { createHmac, timingSafeEqual } from 'crypto'
import { PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { applyPaymentUpdate, type GatewayPaymentStatus } from '@/lib/order-payment-update'
import { sendNewOrderOpsEmail } from '@/lib/order-ops-email'

const PAYSTACK_API_BASE = 'https://api.paystack.co'

/** Orders are stored in KES; Paystack charges in the currency's subunit (cents). */
export const PAYSTACK_CURRENCY = 'KES'

export function toPaystackAmount(amountKes: number): number {
  return Math.round(amountKes * 100)
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!key) {
    throw new Error('Missing Paystack configuration: PAYSTACK_SECRET_KEY')
  }
  return key
}

type PaystackEnvelope<T> = {
  status: boolean
  message: string
  data: T
}

async function paystackRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${getSecretKey()}`)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${PAYSTACK_API_BASE}${path}`, { ...init, headers, cache: 'no-store' })
  const body = (await response.json().catch(() => null)) as PaystackEnvelope<T> | null

  if (!response.ok || !body?.status) {
    throw new Error(body?.message || `Paystack request failed (${response.status})`)
  }
  return body.data
}

export type InitializeTransactionInput = {
  email: string
  amountKes: number
  reference: string
  callbackUrl: string
  cancelUrl: string
  metadata?: Record<string, unknown>
}

export async function initializeTransaction(input: InitializeTransactionInput) {
  return paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        amount: toPaystackAmount(input.amountKes),
        currency: PAYSTACK_CURRENCY,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { ...input.metadata, cancel_action: input.cancelUrl },
      }),
    }
  )
}

export type PaystackTransaction = {
  id: number
  status: string
  reference: string
  amount: number
  currency: string
  channel?: string
  gateway_response?: string
  paid_at?: string | null
}

export async function verifyTransaction(reference: string) {
  return paystackRequest<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  )
}

/** Paystack signs webhook bodies with HMAC-SHA512 of the raw body using the secret key. */
export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = createHmac('sha512', getSecretKey()).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const actualBuf = Buffer.from(signature, 'hex')
  return expectedBuf.length === actualBuf.length && timingSafeEqual(expectedBuf, actualBuf)
}

function mapPaystackStatus(status: string): GatewayPaymentStatus {
  switch (status) {
    case 'success':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'reversed':
      return 'cancelled'
    // "abandoned" means started but not finished — the customer can still complete it.
    default:
      return 'pending'
  }
}

export type ConfirmPaystackResult = {
  orderId: string | null
  paymentStatus: PaymentStatus | null
}

/**
 * Verify a transaction with Paystack (never trust callback query params or webhook
 * payloads alone) and apply the result to the matching order. Safe to call repeatedly.
 */
export async function confirmPaystackPayment(reference: string): Promise<ConfirmPaystackResult> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: reference },
    select: { id: true, total: true, paymentStatus: true },
  })

  if (!order) {
    console.error('[paystack] order not found for reference', { reference })
    return { orderId: null, paymentStatus: null }
  }

  if (order.paymentStatus === PaymentStatus.COMPLETED) {
    return { orderId: order.id, paymentStatus: order.paymentStatus }
  }

  const transaction = await verifyTransaction(reference)
  let gatewayStatus = mapPaystackStatus(transaction.status)

  if (
    gatewayStatus === 'completed' &&
    (transaction.currency !== PAYSTACK_CURRENCY ||
      transaction.amount !== toPaystackAmount(order.total))
  ) {
    console.error('[paystack] amount or currency mismatch', {
      reference,
      expected: { amount: toPaystackAmount(order.total), currency: PAYSTACK_CURRENCY },
      received: { amount: transaction.amount, currency: transaction.currency },
    })
    gatewayStatus = 'failed'
  }

  // Leave the order untouched while Paystack still reports it in progress.
  if (gatewayStatus === 'pending') {
    return { orderId: order.id, paymentStatus: order.paymentStatus }
  }

  const result = await applyPaymentUpdate({
    orderId: order.id,
    method: PaymentMethod.PAYSTACK,
    gatewayStatus,
    transactionId: String(transaction.id),
    amount: transaction.amount / 100,
    currency: transaction.currency,
    gatewayResponse: {
      reference: transaction.reference,
      status: transaction.status,
      channel: transaction.channel,
      gateway_response: transaction.gateway_response,
      paid_at: transaction.paid_at,
    },
  })

  // emailSent is true only on the first PENDING → CONFIRMED transition.
  if (result.emailSent) {
    try {
      await sendNewOrderOpsEmail(order.id)
    } catch (error) {
      console.error('[paystack] failed to send ops notification:', error)
    }
  }

  return { orderId: order.id, paymentStatus: result.paymentStatus }
}
