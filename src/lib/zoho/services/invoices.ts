/**
 * Zoho Books Invoices Service
 * Handles invoice creation and management in Zoho Books
 */

import { zohoClient } from '../client'
import { prisma } from '@/lib/prisma'
import type {
  ZohoInvoice,
  ZohoResponse,
  CreateInvoiceFromSalesOrderPayload,
} from '../types'

/**
 * Create invoice from sales order in Zoho Books
 */
export async function createZohoInvoiceFromSalesOrder(
  orderId: string
): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  if (!order.zohoSalesOrderId) {
    throw new Error(`Order not synced to Zoho: ${orderId}`)
  }

  // Create invoice from sales order
  const payload: CreateInvoiceFromSalesOrderPayload = {
    salesorder_id: order.zohoSalesOrderId,
  }

  const response = await zohoClient.post<
    ZohoResponse<{ invoice: ZohoInvoice }>
  >(`/invoices/fromsalesorder`, payload)

  const zohoInvoiceId = response.invoice.invoice_id

  // Update order with invoice ID
  await prisma.order.update({
    where: { id: orderId },
    data: {
      zohoInvoiceId,
      lastSyncedAt: new Date(),
    },
  })

  return zohoInvoiceId
}

/**
 * Get invoice from Zoho Books
 */
export async function getZohoInvoice(invoiceId: string): Promise<ZohoInvoice> {
  const response = await zohoClient.get<ZohoResponse<{ invoice: ZohoInvoice }>>(
    `/invoices/${invoiceId}`
  )
  return response.invoice
}

/**
 * Mark invoice as sent in Zoho Books
 */
export async function markZohoInvoiceAsSent(invoiceId: string): Promise<void> {
  await zohoClient.post(`/invoices/${invoiceId}/status/sent`, {})
}

/**
 * Void invoice in Zoho Books
 */
export async function voidZohoInvoice(invoiceId: string): Promise<void> {
  await zohoClient.post(`/invoices/${invoiceId}/status/void`, {})
}

/**
 * Get invoice PDF URL from Zoho Books
 */
export async function getZohoInvoicePdfUrl(invoiceId: string): Promise<string> {
  // Note: This returns a temporary URL that expires
  const response = await zohoClient.get<{ code: number; message: string }>(
    `/invoices/${invoiceId}?accept=pdf`
  )
  
  // The PDF URL is typically in the response headers or body
  // You may need to adjust this based on actual Zoho API response
  return `/invoices/${invoiceId}?accept=pdf`
}
