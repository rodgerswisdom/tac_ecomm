import { createHmac, timingSafeEqual } from 'crypto'
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { applyPaymentUpdate, type GatewayPaymentStatus } from '@/lib/order-payment-update'
import { sendNewOrderOpsEmail, sendOpsAlertEmail } from '@/lib/order-ops-email'
import { InsufficientStockError, releaseOrderStock } from '@/lib/stock'
import { scheduleBackInStockNotifications } from '@/lib/stock-notify'

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
    // "abandoned"/"ongoing"/"processing": started but not finished — can still complete.
    default:
      return 'pending'
  }
}

// ---------------------------------------------------------------------------
// References: one order, many payment attempts
// ---------------------------------------------------------------------------

/** Unpaid orders expire this long after the latest payment attempt starts. */
export const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Paystack needs a unique reference per transaction. Attempt 1 uses the order number
 * (so older orders keep working); retries append ".<attempt>" — "." is allowed by
 * Paystack and never appears in order numbers.
 */
export function paystackReference(orderNumber: string, attempt: number): string {
  return attempt <= 1 ? orderNumber : `${orderNumber}.${attempt}`
}

export function orderNumberFromReference(reference: string): string {
  const dot = reference.lastIndexOf('.')
  return dot === -1 ? reference : reference.slice(0, dot)
}

type PaystackPaymentMeta = {
  reference?: string
  status?: string
  channel?: string
  gateway_response?: string
  paid_at?: string | null
  /** Set when a human must decide what to do (refund, restock…). */
  review?: string
  /** Total processed refunds in the currency subunit, and which refunds were counted. */
  refunded_subunits?: number
  refund_ids?: number[]
}

export function parsePaystackMeta(gatewayResponse: string | null | undefined): PaystackPaymentMeta {
  if (!gatewayResponse) return {}
  try {
    return JSON.parse(gatewayResponse) as PaystackPaymentMeta
  } catch {
    return {}
  }
}

/** Start (or restart) payment for an order: opens a Paystack transaction and records the attempt. */
export async function startPaystackPayment(input: {
  order: { id: string; orderNumber: string; total: number }
  email: string
  attempt: number
  baseUrl: string
  metadata?: Record<string, unknown>
}): Promise<string> {
  const { order, attempt } = input
  const baseUrl = input.baseUrl.replace(/\/$/, '')
  const reference = paystackReference(order.orderNumber, attempt)

  const transaction = await initializeTransaction({
    email: input.email,
    amountKes: order.total,
    reference,
    callbackUrl: `${baseUrl}/api/payment/paystack/callback`,
    // Closing Paystack's page returns here, where the customer can resume payment.
    cancelUrl: `${baseUrl}/checkout/thank-you?orderId=${encodeURIComponent(order.id)}&status=cancelled`,
    metadata: { ...input.metadata, orderId: order.id, orderNumber: order.orderNumber, attempt },
  })

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: PaymentMethod.PAYSTACK,
      status: PaymentStatus.PENDING,
      amount: order.total,
      currency: PAYSTACK_CURRENCY,
      gatewayResponse: JSON.stringify({ reference } satisfies PaystackPaymentMeta),
    },
  })

  return transaction.authorization_url
}

// ---------------------------------------------------------------------------
// Confirmation
// ---------------------------------------------------------------------------

export type ConfirmPaystackResult = {
  orderId: string | null
  paymentStatus: PaymentStatus | null
}

type OrderForConfirm = {
  id: string
  orderNumber: string
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentAttempt: number
  couponCode: string | null
  userId: string
  payments: { id: string; status: PaymentStatus; transactionId: string | null; gatewayResponse: string | null }[]
}

async function loadOrderForConfirm(orderNumber: string): Promise<OrderForConfirm | null> {
  return prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      paymentStatus: true,
      paymentAttempt: true,
      couponCode: true,
      userId: true,
      payments: {
        where: { method: PaymentMethod.PAYSTACK },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, transactionId: true, gatewayResponse: true },
      },
    },
  })
}

function findAttemptPayment(order: OrderForConfirm, reference: string) {
  return order.payments.find((payment) => parsePaystackMeta(payment.gatewayResponse).reference === reference)
}

function metaFromTransaction(transaction: PaystackTransaction, review?: string): PaystackPaymentMeta {
  return {
    reference: transaction.reference,
    status: transaction.status,
    channel: transaction.channel,
    gateway_response: transaction.gateway_response,
    paid_at: transaction.paid_at,
    ...(review ? { review } : {}),
  }
}

/** Save a Paystack transaction onto its attempt's Payment row, creating the row if needed. */
async function upsertAttemptPayment(
  order: OrderForConfirm,
  transaction: PaystackTransaction,
  status: PaymentStatus,
  review?: string
) {
  const data = {
    status,
    transactionId: String(transaction.id),
    amount: transaction.amount / 100,
    currency: transaction.currency,
    gatewayResponse: JSON.stringify(metaFromTransaction(transaction, review)),
  }
  const existing = findAttemptPayment(order, transaction.reference)
  try {
    if (existing) {
      await prisma.payment.update({ where: { id: existing.id }, data })
    } else {
      await prisma.payment.create({ data: { ...data, orderId: order.id, method: PaymentMethod.PAYSTACK } })
    }
    return true
  } catch (error) {
    // transactionId is unique: another request already recorded this transaction.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return false
    throw error
  }
}

/** Money was taken but something needs a person: keep the order out of fulfilment and alert ops. */
async function flagForReview(
  order: OrderForConfirm,
  transaction: PaystackTransaction,
  reason: string,
  opts: { markPaid: boolean }
) {
  const firstTime = await upsertAttemptPayment(order, transaction, PaymentStatus.COMPLETED, reason)
  if (opts.markPaid) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.COMPLETED, paidAt: new Date() },
      }),
      prisma.cartItem.deleteMany({ where: { userId: order.userId } }),
    ])
  }
  const note = `[Payment review] ${reason} (Paystack ref ${transaction.reference})`
  const current = await prisma.order.findUnique({ where: { id: order.id }, select: { notes: true } })
  if (!current?.notes?.includes(note)) {
    await prisma.order.update({
      where: { id: order.id },
      // Keep any notes staff already wrote.
      data: { notes: current?.notes ? `${note}\n${current.notes}` : note },
    })
  }
  if (!firstTime) return
  try {
    await sendOpsAlertEmail({
      subject: `Payment needs review: ${order.orderNumber}`,
      lines: [
        reason,
        `Order: ${order.orderNumber} (order total KES ${Math.round(order.total).toLocaleString()})`,
        `Paystack reference: ${transaction.reference}`,
        `Paystack amount: ${transaction.currency} ${(transaction.amount / 100).toLocaleString()}`,
        'The order has not been sent to fulfilment. Open it in admin to decide on a refund or next steps.',
      ],
    })
  } catch (error) {
    console.error('[paystack] failed to send review alert:', error)
  }
}

async function recordFailedAttempt(order: OrderForConfirm, transaction: PaystackTransaction) {
  await upsertAttemptPayment(order, transaction, PaymentStatus.FAILED)
  // Only the latest attempt decides the order's payment status, and the order stays
  // PENDING so the customer can retry (unlike deriveOrderStatus, which would cancel it).
  if (transaction.reference === paystackReference(order.orderNumber, order.paymentAttempt)) {
    await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: PaymentStatus.PENDING },
      data: { paymentStatus: PaymentStatus.FAILED },
    })
  }
}

async function onFirstSuccessfulPayment(order: OrderForConfirm) {
  if (order.couponCode) {
    await prisma.coupon
      .updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } })
      .catch((error) => console.error('[paystack] coupon usage update failed:', error))
  }
  try {
    await sendNewOrderOpsEmail(order.id)
  } catch (error) {
    console.error('[paystack] failed to send ops notification:', error)
  }
}

/**
 * Verify one Paystack transaction (never trusting callback params or webhook payloads)
 * and apply it to its order. Safe to call any number of times, from any path.
 */
export async function confirmPaystackPayment(reference: string): Promise<ConfirmPaystackResult> {
  const order = await loadOrderForConfirm(orderNumberFromReference(reference))
  if (!order) {
    console.error('[paystack] order not found for reference', { reference })
    return { orderId: null, paymentStatus: null }
  }
  const done = { orderId: order.id, paymentStatus: order.paymentStatus }

  // Already settled for this exact attempt, or waiting on a person — nothing to re-check.
  const attemptPayment = findAttemptPayment(order, reference)
  const attemptMeta = parsePaystackMeta(attemptPayment?.gatewayResponse)
  if (
    attemptMeta.review ||
    attemptPayment?.status === PaymentStatus.COMPLETED ||
    attemptPayment?.status === PaymentStatus.REFUNDED
  ) {
    return done
  }
  // Refunds are handled by syncPaystackRefunds; never re-open a refunded order.
  if (order.paymentStatus === PaymentStatus.REFUNDED) return done

  const transaction = await verifyTransaction(reference)
  const gatewayStatus = mapPaystackStatus(transaction.status)

  if (gatewayStatus === 'pending') return done

  if (gatewayStatus === 'failed') {
    if (order.paymentStatus !== PaymentStatus.COMPLETED) await recordFailedAttempt(order, transaction)
    const fresh = await prisma.order.findUnique({ where: { id: order.id }, select: { paymentStatus: true } })
    return { orderId: order.id, paymentStatus: fresh?.paymentStatus ?? order.paymentStatus }
  }

  if (gatewayStatus === 'completed') {
    // A second successful attempt on an order that is already paid: the customer paid twice.
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      await flagForReview(order, transaction, 'Duplicate payment — this order was already paid by another attempt. Refund this transaction.', { markPaid: false })
      return done
    }
    if (transaction.currency !== PAYSTACK_CURRENCY || transaction.amount !== toPaystackAmount(order.total)) {
      await flagForReview(
        order,
        transaction,
        `Amount mismatch — expected KES ${order.total.toLocaleString()}, Paystack received ${transaction.currency} ${(transaction.amount / 100).toLocaleString()}.`,
        { markPaid: false }
      )
      return done
    }
    if (order.status === OrderStatus.CANCELLED) {
      await flagForReview(order, transaction, 'Paid after the order was cancelled. Refund, or re-open and fulfil it.', { markPaid: true })
      return { orderId: order.id, paymentStatus: PaymentStatus.COMPLETED }
    }
    // Late payment on an expired order: re-open it so it confirms normally.
    if (order.status === OrderStatus.EXPIRED) {
      await prisma.order.updateMany({
        where: { id: order.id, status: OrderStatus.EXPIRED },
        data: { status: OrderStatus.PENDING },
      })
    }
  }

  const update = () =>
    applyPaymentUpdate({
      orderId: order.id,
      method: PaymentMethod.PAYSTACK,
      paymentId: attemptPayment?.id,
      gatewayStatus,
      transactionId: String(transaction.id),
      amount: transaction.amount / 100,
      currency: transaction.currency,
      gatewayResponse: metaFromTransaction(transaction),
    })

  let result: Awaited<ReturnType<typeof applyPaymentUpdate>>
  try {
    try {
      result = await update()
    } catch (error) {
      // Callback and webhook racing on the unique transactionId: retry updates the winner's row.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        result = await update()
      } else {
        throw error
      }
    }
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      // Paid, but stock ran out meanwhile. Keep the money recorded, hold the order for ops.
      await flagForReview(order, transaction, `Paid, but not enough stock to fulfil (${error.message}). Restock/backorder or refund.`, { markPaid: true })
      return { orderId: order.id, paymentStatus: PaymentStatus.COMPLETED }
    }
    throw error
  }

  // emailSent is true only on the first PENDING → CONFIRMED transition.
  if (result.emailSent) await onFirstSuccessfulPayment(order)

  return { orderId: order.id, paymentStatus: result.paymentStatus }
}

// ---------------------------------------------------------------------------
// Reconciliation (thank-you polling, admin re-check, cron)
// ---------------------------------------------------------------------------

const RECONCILE_INTERVAL_MS = 8_000
const lastReconcileAt = new Map<string, number>()

/**
 * Ask Paystack about every attempt of an unpaid Paystack order (newest first). Throttled
 * per order unless `force`. Never throws — callers re-read the order afterwards.
 */
export async function reconcilePaystackOrder(
  where: { id: string } | { orderNumber: string },
  opts: { force?: boolean } = {}
): Promise<void> {
  const order = await prisma.order.findUnique({
    where,
    select: { id: true, orderNumber: true, paymentMethod: true, paymentStatus: true, paymentAttempt: true },
  })
  // Only unpaid orders need re-checking — including expired ones, which a late payment can
  // still settle. Paid/refunded orders are settled (refunds: syncPaystackRefunds).
  if (
    !order ||
    order.paymentMethod !== PaymentMethod.PAYSTACK ||
    order.paymentStatus === PaymentStatus.COMPLETED ||
    order.paymentStatus === PaymentStatus.REFUNDED
  ) {
    return
  }

  const now = Date.now()
  if (!opts.force && now - (lastReconcileAt.get(order.id) ?? 0) < RECONCILE_INTERVAL_MS) return
  lastReconcileAt.set(order.id, now)

  for (let attempt = order.paymentAttempt; attempt >= 1; attempt--) {
    try {
      const result = await confirmPaystackPayment(paystackReference(order.orderNumber, attempt))
      if (result.paymentStatus === PaymentStatus.COMPLETED) return
    } catch (error) {
      // e.g. an attempt that never reached Paystack ("Transaction reference not found").
      console.error('[paystack] reconcile failed:', { orderNumber: order.orderNumber, attempt, error })
    }
  }
}

/** True when a payment on the order is waiting for a person (see flagForReview). */
export function paystackReviewReason(
  payments: { method: PaymentMethod | string; gatewayResponse: string | null }[]
): string | null {
  for (const payment of payments) {
    if (payment.method !== PaymentMethod.PAYSTACK) continue
    const review = parsePaystackMeta(payment.gatewayResponse).review
    if (review) return review
  }
  return null
}

/**
 * Cron: re-check unpaid Paystack orders (catching missed webhooks), then expire the ones
 * whose payment window has passed — after one final check with Paystack.
 */
export async function reconcileAndExpirePaystackOrders(opts: { limit?: number; budgetMs?: number } = {}) {
  const limit = opts.limit ?? 25
  // Stay well inside the 30s function limit; the next run picks up the rest.
  const deadline = Date.now() + (opts.budgetMs ?? 20_000)
  const now = new Date()
  const settleAfter = new Date(now.getTime() - 5 * 60 * 1000)
  const candidates = await prisma.order.findMany({
    where: {
      paymentMethod: PaymentMethod.PAYSTACK,
      status: OrderStatus.PENDING,
      paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
      createdAt: { lt: settleAfter },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true, createdAt: true, paymentExpiresAt: true },
  })

  let confirmed = 0
  let expired = 0
  for (const candidate of candidates) {
    if (Date.now() > deadline) break
    await reconcilePaystackOrder({ id: candidate.id }, { force: true })
    const fresh = await prisma.order.findUnique({
      where: { id: candidate.id },
      select: {
        paymentStatus: true,
        payments: { select: { method: true, gatewayResponse: true } },
      },
    })
    if (!fresh) continue
    if (fresh.paymentStatus === PaymentStatus.COMPLETED) {
      confirmed++
      continue
    }
    if (paystackReviewReason(fresh.payments)) continue

    const expiresAt = candidate.paymentExpiresAt ?? new Date(candidate.createdAt.getTime() + PAYMENT_WINDOW_MS)
    if (expiresAt <= now) {
      const res = await prisma.order.updateMany({
        where: { id: candidate.id, status: OrderStatus.PENDING, paymentStatus: { not: PaymentStatus.COMPLETED } },
        data: { status: OrderStatus.EXPIRED, paymentStatus: PaymentStatus.CANCELLED },
      })
      expired += res.count
    }
  }

  return { checked: candidates.length, confirmed, expired }
}


// ---------------------------------------------------------------------------
// Refunds (Paystack dashboard refunds, bank reversals)
// ---------------------------------------------------------------------------

type PaystackRefund = {
  id: number
  amount: number
  currency: string
  status: string
  transaction?: number | { id?: number; reference?: string }
  transaction_reference?: string
}

/** Processed refunds for one transaction. Filters client-side so an unfiltered API list can't leak in. */
async function listProcessedRefunds(transactionId: string, reference: string): Promise<PaystackRefund[]> {
  const query = new URLSearchParams({ transaction: transactionId, reference, perPage: '100' })
  const refunds = await paystackRequest<PaystackRefund[]>(`/refund?${query.toString()}`)
  return (refunds ?? []).filter((refund) => {
    const tx = refund.transaction
    const matches =
      String(typeof tx === 'object' ? tx?.id : tx) === transactionId ||
      (typeof tx === 'object' && tx?.reference === reference) ||
      refund.transaction_reference === reference
    return matches && refund.status === 'processed'
  })
}

async function appendOrderNote(orderId: string, note: string) {
  const current = await prisma.order.findUnique({ where: { id: orderId }, select: { notes: true } })
  if (current?.notes?.includes(note)) return
  await prisma.order.update({
    where: { id: orderId },
    data: { notes: current?.notes ? `${note}\n${current.notes}` : note },
  })
}

/**
 * Bring an order in line with refunds processed on Paystack for one payment attempt.
 * Full refund of the payment that paid the order → order REFUNDED and stock returned
 * (unless shipped). Refund of an extra payment (duplicate/mismatch) → only that payment.
 * Partial refunds are noted for staff. Safe to call repeatedly.
 */
export async function syncPaystackRefunds(reference: string): Promise<void> {
  const order = await loadOrderForConfirm(orderNumberFromReference(reference))
  if (!order) return
  const payment = findAttemptPayment(order, reference)
  if (!payment?.transactionId) return
  if (payment.status !== PaymentStatus.COMPLETED && payment.status !== PaymentStatus.REFUNDED) return

  const meta = parsePaystackMeta(payment.gatewayResponse)
  const refunds = await listProcessedRefunds(payment.transactionId, reference)
  const refundedSubunits = refunds.reduce((sum, refund) => sum + refund.amount, 0)
  if (refundedSubunits === 0 || refundedSubunits === meta.refunded_subunits) return

  const fullDetails = await prisma.payment.findUnique({ where: { id: payment.id }, select: { amount: true } })
  const paidSubunits = toPaystackAmount(fullDetails?.amount ?? 0)
  const isFull = refundedSubunits >= paidSubunits
  const refundedKes = (refundedSubunits / 100).toLocaleString()

  const nextMeta: PaystackPaymentMeta = {
    ...meta,
    refunded_subunits: refundedSubunits,
    refund_ids: refunds.map((refund) => refund.id),
  }

  if (!isFull) {
    await prisma.payment.update({ where: { id: payment.id }, data: { gatewayResponse: JSON.stringify(nextMeta) } })
    await appendOrderNote(order.id, `[Refund] Partial refund of KES ${refundedKes} processed on Paystack (ref ${reference}).`)
    return
  }

  // A refunded extra payment (duplicate / amount mismatch) resolves its review; the order is untouched.
  const otherPaid = order.payments.some((p) => p.id !== payment.id && p.status === PaymentStatus.COMPLETED)
  const paidTheOrder = order.paymentStatus === PaymentStatus.COMPLETED && !otherPaid
  delete nextMeta.review

  const current = await prisma.order.findUnique({ where: { id: order.id }, select: { status: true } })
  const shipped = current?.status === OrderStatus.SHIPPED || current?.status === OrderStatus.DELIVERED
  let restocked: string[] = []

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED, gatewayResponse: JSON.stringify(nextMeta) },
    })
    if (!paidTheOrder) return
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.REFUNDED, status: OrderStatus.REFUNDED },
    })
    if (!shipped) restocked = await releaseOrderStock(order.id, tx)
  })

  if (restocked.length > 0) scheduleBackInStockNotifications(restocked)

  await appendOrderNote(
    order.id,
    paidTheOrder
      ? `[Refund] Full refund of KES ${refundedKes} processed on Paystack (ref ${reference}).${
          shipped ? ' Stock not returned because the order had shipped.' : ''
        }`
      : `[Refund] Extra payment of KES ${refundedKes} refunded on Paystack (ref ${reference}); order unchanged.`
  )
}

/** Check refunds for every paid Paystack attempt on an order (admin re-check). */
export async function syncPaystackRefundsForOrder(orderId: string): Promise<void> {
  const payments = await prisma.payment.findMany({
    where: { orderId, method: PaymentMethod.PAYSTACK, status: { in: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED] } },
    select: { gatewayResponse: true },
  })
  for (const payment of payments) {
    const reference = parsePaystackMeta(payment.gatewayResponse).reference
    if (!reference) continue
    try {
      await syncPaystackRefunds(reference)
    } catch (error) {
      console.error('[paystack] refund sync failed:', { reference, error })
    }
  }
}
