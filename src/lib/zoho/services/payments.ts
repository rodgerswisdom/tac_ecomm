/**
 * Zoho Books Payments Service
 * Handles payment recording in Zoho Books
 */

import { zohoClient } from '../client'
import { prisma } from '@/lib/prisma'
import type {
  ZohoPayment,
  ZohoResponse,
  CreatePaymentPayload,
} from '../types'

/**
 * Record payment in Zoho Books
 */
export async function recordZohoPayment(paymentId: string): Promise<string> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`)
  }

  if (!payment.order.zohoInvoiceId) {
    throw new Error(
      `Order invoice not synced to Zoho: ${payment.orderId}. Please create invoice first.`
    )
  }

  // Map payment method to Zoho payment mode
  const paymentModeMap: Record<string, string> = {
    PAYPAL: 'paypal',
    PESAPAL: 'mpesa',
    TUMA: 'mpesa',
    CREDIT_CARD: 'creditcard',
    BANK_TRANSFER: 'banktransfer',
  }

  const paymentMode = paymentModeMap[payment.method] || 'cash'

  // Prepare payment payload
  const payload: CreatePaymentPayload = {
    customer_id: payment.order.user.zohoContactId!,
    payment_mode: paymentMode,
    amount: payment.amount,
    date: payment.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
    reference_number: payment.transactionId || undefined,
    description: `Payment for order ${payment.order.orderNumber}`,
    invoices: [
      {
        invoice_id: payment.order.zohoInvoiceId,
        amount_applied: payment.amount,
      },
    ],
  }

  // Record payment in Zoho
  const response = await zohoClient.post<
    ZohoResponse<{ payment: ZohoPayment }>
  >('/customerpayments', payload)

  const zohoPaymentId = response.payment.payment_id

  // Update payment with Zoho ID
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      zohoPaymentId,
      zohoSyncStatus: 'synced',
      lastSyncedAt: new Date(),
      syncError: null,
    },
  })

  return zohoPaymentId
}

/**
 * Get payment from Zoho Books
 */
export async function getZohoPayment(paymentId: string): Promise<ZohoPayment> {
  const response = await zohoClient.get<ZohoResponse<{ payment: ZohoPayment }>>(
    `/customerpayments/${paymentId}`
  )
  return response.payment
}

/**
 * Delete payment from Zoho Books
 */
export async function deleteZohoPayment(paymentId: string): Promise<void> {
  await zohoClient.delete(`/customerpayments/${paymentId}`)
}
