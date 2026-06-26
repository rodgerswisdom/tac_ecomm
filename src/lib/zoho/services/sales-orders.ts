/**
 * Zoho Books Sales Orders Service
 * Handles order synchronization with Zoho Books
 */

import { zohoClient } from '../client'
import { prisma } from '@/lib/prisma'
import { ensureZohoContact } from './contacts'
import type {
  ZohoSalesOrder,
  ZohoResponse,
  CreateSalesOrderPayload,
} from '../types'

/**
 * Create sales order in Zoho Books
 */
export async function createZohoSalesOrder(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
  })

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  // Ensure customer exists in Zoho
  const zohoContactId = await ensureZohoContact(order.userId)

  // Ensure all products are synced to Zoho
  for (const item of order.items) {
    if (!item.product.zohoItemId) {
      throw new Error(
        `Product not synced to Zoho: ${item.product.name} (${item.productId}). Please sync products first.`
      )
    }
  }

  // Prepare line items
  const lineItems = order.items.map((item) => ({
    item_id: item.product.zohoItemId!,
    quantity: item.quantity,
    rate: item.price,
  }))

  // Prepare sales order payload
  const payload: CreateSalesOrderPayload = {
    customer_id: zohoContactId,
    salesorder_number: order.orderNumber,
    date: order.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
    line_items: lineItems,
    shipping_charge: order.shipping,
    notes: order.notes || undefined,
  }

  // Create sales order in Zoho
  const response = await zohoClient.post<
    ZohoResponse<{ salesorder: ZohoSalesOrder }>
  >('/salesorders', payload)

  const zohoSalesOrderId = response.salesorder.salesorder_id

  // Update order with Zoho ID
  await prisma.order.update({
    where: { id: orderId },
    data: {
      zohoSalesOrderId,
      zohoSyncStatus: 'synced',
      lastSyncedAt: new Date(),
      syncError: null,
    },
  })

  return zohoSalesOrderId
}

/**
 * Get sales order from Zoho Books
 */
export async function getZohoSalesOrder(
  salesOrderId: string
): Promise<ZohoSalesOrder> {
  const response = await zohoClient.get<
    ZohoResponse<{ salesorder: ZohoSalesOrder }>
  >(`/salesorders/${salesOrderId}`)
  return response.salesorder
}

/**
 * Update sales order status in Zoho Books
 */
export async function updateZohoSalesOrderStatus(
  salesOrderId: string,
  status: 'draft' | 'open' | 'void'
): Promise<void> {
  await zohoClient.post(`/salesorders/${salesOrderId}/status/${status}`, {})
}

/**
 * Mark sales order as void in Zoho Books
 */
export async function voidZohoSalesOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order?.zohoSalesOrderId) {
    throw new Error(`Order not synced to Zoho: ${orderId}`)
  }

  await updateZohoSalesOrderStatus(order.zohoSalesOrderId, 'void')

  // Update local status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      lastSyncedAt: new Date(),
    },
  })
}
