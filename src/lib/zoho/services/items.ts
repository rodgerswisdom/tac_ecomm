/**
 * Zoho Books Items (Products) Service
 * Handles product synchronization with Zoho Books
 */

import { zohoClient } from '../client'
import { prisma } from '@/lib/prisma'
import type {
  ZohoItem,
  ZohoResponse,
  CreateItemPayload,
  UpdateItemPayload,
} from '../types'

/**
 * Create item in Zoho Books
 */
export async function createZohoItem(productId: string): Promise<string> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  })

  if (!product) {
    throw new Error(`Product not found: ${productId}`)
  }

  // Prepare item payload
  const payload: CreateItemPayload = {
    name: product.name,
    sku: product.sku,
    description: product.description,
    rate: product.price, // Price in KSH
    unit: 'pcs',
    item_type: 'inventory',
    product_type: 'goods',
    is_taxable: true,
    initial_stock: product.stock,
    initial_stock_rate: product.price,
    reorder_level: 5,
  }

  // Create item in Zoho
  const response = await zohoClient.post<ZohoResponse<{ item: ZohoItem }>>(
    '/items',
    payload
  )

  const zohoItemId = response.item.item_id

  // Update product with Zoho ID
  await prisma.product.update({
    where: { id: productId },
    data: {
      zohoItemId,
      zohoSyncStatus: 'synced',
      lastSyncedAt: new Date(),
      syncError: null,
    },
  })

  return zohoItemId
}

/**
 * Update item in Zoho Books
 */
export async function updateZohoItem(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error(`Product not found: ${productId}`)
  }

  if (!product.zohoItemId) {
    throw new Error(`Product not synced to Zoho: ${productId}`)
  }

  // Prepare update payload
  const payload: UpdateItemPayload = {
    item_id: product.zohoItemId,
    name: product.name,
    sku: product.sku,
    description: product.description,
    rate: product.price,
  }

  // Update item in Zoho
  await zohoClient.put<ZohoResponse<{ item: ZohoItem }>>(
    `/items/${product.zohoItemId}`,
    payload
  )

  // Update sync status
  await prisma.product.update({
    where: { id: productId },
    data: {
      zohoSyncStatus: 'synced',
      lastSyncedAt: new Date(),
      syncError: null,
    },
  })
}

/**
 * Get item from Zoho Books
 */
export async function getZohoItem(itemId: string): Promise<ZohoItem> {
  const response = await zohoClient.get<ZohoResponse<{ item: ZohoItem }>>(
    `/items/${itemId}`
  )
  return response.item
}

/**
 * Update stock from Zoho Books
 */
export async function syncStockFromZoho(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product?.zohoItemId) {
    throw new Error(`Product not synced to Zoho: ${productId}`)
  }

  // Get item from Zoho
  const zohoItem = await getZohoItem(product.zohoItemId)

  // Update local stock if different
  if (zohoItem.stock_on_hand !== undefined && zohoItem.stock_on_hand !== product.stock) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: zohoItem.stock_on_hand,
        lastSyncedAt: new Date(),
      },
    })
  }
}

/**
 * Batch sync stock for multiple products
 */
export async function batchSyncStock(productIds: string[]): Promise<void> {
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      zohoItemId: { not: null },
    },
  })

  for (const product of products) {
    try {
      await syncStockFromZoho(product.id)
    } catch (error) {
      console.error(`Failed to sync stock for product ${product.id}:`, error)
      // Continue with other products
    }
  }
}

/**
 * Delete item from Zoho Books
 */
export async function deleteZohoItem(itemId: string): Promise<void> {
  await zohoClient.delete(`/items/${itemId}`)
}
