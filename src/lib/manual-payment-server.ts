import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { EmailService, getEmailConfig } from '@/lib/email'
import { InsufficientStockError, releaseOrderStock, takeOrderStock } from '@/lib/stock'
import { scheduleBackInStockNotifications } from '@/lib/stock-notify'
import { applyPaymentUpdate } from '@/lib/order-payment-update'
import { sendNewOrderOpsEmail, sendOpsAlertEmail } from '@/lib/order-ops-email'
import {
  MANUAL_PAYMENT,
  MANUAL_PAYMENT_WINDOW_MS,
  parseManualPaymentMeta,
  type ManualPaymentMeta,
} from '@/lib/manual-payment'

/** Paybill orders are recorded as BANK_TRANSFER — see src/lib/manual-payment.ts. */
export const MANUAL_PAYMENT_METHOD = PaymentMethod.BANK_TRANSFER

type Result = { ok: true; message?: string } | { ok: false; error: string }

function baseUrl() {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://www.tacaccessories.co.ke').replace(/\/$/, '')
}

function formatKes(amount: number) {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function sendCustomerEmail(to: string, subject: string, paragraphs: string[]) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #4a2b28;">
      ${paragraphs.map((p) => `<p style="margin: 0 0 12px 0;">${escapeHtml(p)}</p>`).join('')}
      <p style="margin: 16px 0 0 0;">TAC Accessories<br />${escapeHtml(MANUAL_PAYMENT.supportEmail)} · WhatsApp ${escapeHtml(MANUAL_PAYMENT.whatsappDisplay)}</p>
    </div>
  `
  try {
    await new EmailService(getEmailConfig()).sendEmail({ to, subject, html, text: paragraphs.join('\n\n') })
  } catch (error) {
    console.error('[manual-payment] customer email failed:', error)
  }
}

/**
 * Customer says "I've paid": record their M-Pesa code against the order and reserve the
 * stock so the pieces can't sell to someone else while staff check the bank statement.
 */
export async function submitManualPaymentCode(orderId: string, code: string): Promise<Result> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      user: { select: { email: true, name: true } },
      shippingAddress: { select: { firstName: true, lastName: true, phone: true } },
      payments: {
        where: { method: MANUAL_PAYMENT_METHOD },
        select: { id: true, status: true, transactionId: true },
      },
    },
  })
  if (!order || order.paymentMethod !== MANUAL_PAYMENT_METHOD) {
    return { ok: false, error: 'Order not found.' }
  }
  if (order.paymentStatus === PaymentStatus.COMPLETED) {
    return { ok: false, error: 'This order is already paid.' }
  }
  const awaiting = order.payments.find((p) => p.status === PaymentStatus.PENDING)
  if (awaiting) {
    return awaiting.transactionId === code
      ? { ok: true }
      : { ok: false, error: "We're already verifying a payment for this order. Contact us if you need to change the code." }
  }
  // Expired orders can still be paid (money may have been sent late); cancelled/refunded ones can't.
  if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.EXPIRED) {
    return { ok: false, error: 'This order is closed. Please contact us about your payment.' }
  }

  const usedBy = await prisma.payment.findUnique({
    where: { transactionId: code },
    select: { id: true, orderId: true, status: true },
  })
  if (usedBy && (usedBy.orderId !== order.id || usedBy.status !== PaymentStatus.FAILED)) {
    return { ok: false, error: 'This M-Pesa code has already been used for another order.' }
  }

  const meta: ManualPaymentMeta = { submittedAt: new Date().toISOString() }
  let paymentId: string
  try {
    paymentId = await prisma.$transaction(async (tx) => {
      if (order.status === OrderStatus.EXPIRED) {
        await tx.order.updateMany({
          where: { id: order.id, status: OrderStatus.EXPIRED },
          data: { status: OrderStatus.PENDING, paymentStatus: PaymentStatus.PENDING },
        })
      }
      const data = {
        status: PaymentStatus.PENDING,
        amount: order.total,
        currency: 'KES',
        gatewayResponse: JSON.stringify(meta),
      }
      // Resubmitting a code staff rejected earlier on this same order re-opens that record.
      const payment = usedBy
        ? await tx.payment.update({ where: { id: usedBy.id }, data })
        : await tx.payment.create({
            data: { ...data, orderId: order.id, method: MANUAL_PAYMENT_METHOD, transactionId: code },
          })
      return payment.id
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: false, error: 'This M-Pesa code has already been used for another order.' }
    }
    throw error
  }

  // Separate transaction: running out of stock must not lose the customer's code.
  try {
    // Returns false when the stock is already held (e.g. a resubmission), which is fine too.
    await prisma.$transaction((tx) => takeOrderStock(order.id, tx))
    meta.stockReserved = true
  } catch (error) {
    if (!(error instanceof InsufficientStockError)) throw error
    meta.stockReserved = false
  }
  await prisma.payment.update({ where: { id: paymentId }, data: { gatewayResponse: JSON.stringify(meta) } })

  const customerName =
    [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(' ') ||
    order.user.name ||
    'Customer'
  try {
    await sendOpsAlertEmail({
      subject: `M-Pesa payment to verify: ${order.orderNumber}`,
      lines: [
        `${customerName} says they paid ${formatKes(order.total)} to Paybill ${MANUAL_PAYMENT.paybillNumber} (account ${MANUAL_PAYMENT.accountNumber}).`,
        `M-Pesa code: ${code}`,
        `Customer: ${order.user.email} · ${order.shippingAddress?.phone ?? 'no phone'}`,
        meta.stockReserved
          ? 'The items are reserved for this order.'
          : 'WARNING: some items are out of stock, so nothing could be reserved. Restock or refund before confirming.',
        `Check the bank statement, then confirm or reject: ${baseUrl()}/admin/orders/${order.id}`,
      ],
    })
  } catch (error) {
    console.error('[manual-payment] ops alert failed:', error)
  }
  await sendCustomerEmail(order.user.email, `We've received your payment details — ${order.orderNumber}`, [
    `Hi ${customerName},`,
    `Thanks — we've received your M-Pesa code ${code} for order ${order.orderNumber} (${formatKes(order.total)}).`,
    "Our team is matching it against our bank statement. You'll get an email as soon as your order is confirmed, usually within one working day. Please don't pay again.",
  ])

  return { ok: true }
}

async function findAwaitingPayment(orderId: string, paymentId: string) {
  return prisma.payment.findFirst({
    where: { id: paymentId, orderId, method: MANUAL_PAYMENT_METHOD, status: PaymentStatus.PENDING },
    select: {
      id: true,
      transactionId: true,
      gatewayResponse: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          couponCode: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  })
}

/** Staff found the money on the bank statement: confirm the order as paid. */
export async function confirmManualPayment(orderId: string, paymentId: string, adminEmail: string): Promise<Result> {
  const payment = await findAwaitingPayment(orderId, paymentId)
  if (!payment?.transactionId) return { ok: false, error: 'No payment awaiting verification.' }
  if (payment.order.status !== OrderStatus.PENDING) {
    return { ok: false, error: `The order is ${payment.order.status.toLowerCase()}; set it back to pending first.` }
  }

  const meta: ManualPaymentMeta = {
    ...parseManualPaymentMeta(payment.gatewayResponse),
    verifiedBy: adminEmail,
    verifiedAt: new Date().toISOString(),
  }
  let result: Awaited<ReturnType<typeof applyPaymentUpdate>>
  try {
    // Moves the order to CONFIRMED, takes stock if it wasn't reserved, emails the customer.
    result = await applyPaymentUpdate({
      orderId,
      method: MANUAL_PAYMENT_METHOD,
      paymentId,
      gatewayStatus: 'completed',
      transactionId: payment.transactionId,
      amount: payment.order.total,
      currency: 'KES',
      gatewayResponse: meta,
    })
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { ok: false, error: 'Not enough stock to confirm this order. Restock the items (or refund the customer) first.' }
    }
    throw error
  }

  if (result.emailSent) {
    if (payment.order.couponCode) {
      await prisma.coupon
        .updateMany({ where: { code: payment.order.couponCode }, data: { usedCount: { increment: 1 } } })
        .catch((error) => console.error('[manual-payment] coupon usage update failed:', error))
    }
    await sendNewOrderOpsEmail(orderId).catch((error) =>
      console.error('[manual-payment] ops notification failed:', error)
    )
  }
  return { ok: true, message: 'Payment confirmed — the customer has been emailed.' }
}

/** Staff couldn't find the payment: release the stock and ask the customer to check their code. */
export async function rejectManualPayment(
  orderId: string,
  paymentId: string,
  reason: string,
  adminEmail: string
): Promise<Result> {
  const payment = await findAwaitingPayment(orderId, paymentId)
  if (!payment) return { ok: false, error: 'No payment awaiting verification.' }

  const meta: ManualPaymentMeta = {
    ...parseManualPaymentMeta(payment.gatewayResponse),
    rejectedBy: adminEmail,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason || undefined,
  }
  const restocked = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED, gatewayResponse: JSON.stringify(meta) },
    })
    // The order stays open so the customer can send the right code; the clock restarts.
    await tx.order.update({
      where: { id: orderId },
      data: { paymentExpiresAt: new Date(Date.now() + MANUAL_PAYMENT_WINDOW_MS) },
    })
    return releaseOrderStock(orderId, tx)
  })
  if (restocked.length > 0) scheduleBackInStockNotifications(restocked)

  const { order } = payment
  await sendCustomerEmail(order.user.email, `We couldn't confirm your payment — ${order.orderNumber}`, [
    `Hi ${order.user.name || 'there'},`,
    `We couldn't find M-Pesa payment ${payment.transactionId} for ${formatKes(order.total)} on our statement for order ${order.orderNumber}.`,
    ...(reason ? [`Note from our team: ${reason}`] : []),
    `If you've paid, please check the code on your M-Pesa message and submit it again here: ${baseUrl()}/checkout/thank-you?orderId=${order.id}`,
    'If you think this is a mistake, reply to this email or WhatsApp us and we will sort it out.',
  ])
  return { ok: true, message: 'Payment rejected — the customer has been asked to check their code.' }
}

/** Cron: close Paybill orders that never received a code within the payment window. */
export async function expireUnpaidManualOrders(): Promise<{ expired: number }> {
  const candidates = await prisma.order.findMany({
    where: {
      paymentMethod: MANUAL_PAYMENT_METHOD,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentExpiresAt: { lt: new Date() },
      // Never expire an order whose code is waiting for staff: the money may be in the bank.
      payments: { none: { method: MANUAL_PAYMENT_METHOD, status: PaymentStatus.PENDING } },
    },
    select: { id: true },
    take: 50,
  })

  let expired = 0
  for (const { id } of candidates) {
    const restocked = await prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING, paymentStatus: PaymentStatus.PENDING },
        data: { status: OrderStatus.EXPIRED, paymentStatus: PaymentStatus.CANCELLED },
      })
      expired += res.count
      return res.count > 0 ? releaseOrderStock(id, tx) : []
    })
    if (restocked.length > 0) scheduleBackInStockNotifications(restocked)
  }
  return { expired }
}
