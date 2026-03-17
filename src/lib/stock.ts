/**
 * Stock management utilities.
 *
 * All mutations use Prisma's atomic `increment` / `decrement` operators so
 * concurrent requests never produce a race-condition on the stock field.
 *
 * Key design decisions
 * ─────────────────────
 * • decrementStock   – reduces stock when a payment is confirmed. Should only
 *   be called once per order (use the PENDING → CONFIRMED atomic guard).
 * • restoreStock     – increments stock back when an order is cancelled or
 *   refunded after stock had already been decremented (i.e. was CONFIRMED).
 * • For variants, we update ProductVariant.stock; for plain products we update
 *   Product.stock.  If a variantId is present it takes precedence.
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export interface StockLineItem {
  productId: string
  variantId?: string | null
  quantity: number
}

type StockClient = Prisma.TransactionClient

class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsufficientStockError'
  }
}

function getStockClient(tx?: StockClient): StockClient {
  return tx ?? prisma
}

function groupLineItems(items: StockLineItem[]): StockLineItem[] {
  const grouped = new Map<string, StockLineItem>()

  for (const item of items) {
    const quantity = Math.max(0, Math.trunc(item.quantity))
    if (quantity === 0) continue

    const key = item.variantId ? `variant:${item.variantId}` : `product:${item.productId}`
    const existing = grouped.get(key)

    if (existing) {
      existing.quantity += quantity
    } else {
      grouped.set(key, {
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity,
      })
    }
  }

  return [...grouped.values()]
}

/**
 * Atomically decrements stock for each item in `items`.
 * Runs inside a single transaction so it's all-or-nothing.
 *
 * NOTE: Call this *only* after verifying that stock is sufficient (checkout
 * guard) and only once per order (use the PENDING→CONFIRMED atomic guard in
 * the caller).
 */
export async function decrementStock(items: StockLineItem[], tx?: StockClient): Promise<void> {
  const groupedItems = groupLineItems(items)
  if (!groupedItems.length) return

  const run = async (client: StockClient) => {
    for (const item of groupedItems) {
      if (item.variantId) {
        const result = await client.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })

        if (result.count === 0) {
          throw new InsufficientStockError(`Insufficient variant stock for ${item.variantId}`)
        }
      } else {
        const result = await client.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })

        if (result.count === 0) {
          throw new InsufficientStockError(`Insufficient product stock for ${item.productId}`)
        }
      }
    }
  }

  if (tx) {
    await run(tx)
    return
  }

  await prisma.$transaction(async (transaction) => {
    await run(transaction)
  })
}

/**
 * Restores stock for all items belonging to `orderId`.
 * Should be called when an order transitions to CANCELLED or REFUNDED,
 * but **only** if stock was previously decremented (i.e. order was CONFIRMED
 * before cancellation – check this in the caller).
 */
export async function restoreStockItems(items: StockLineItem[], tx?: StockClient): Promise<void> {
  const groupedItems = groupLineItems(items)
  if (!groupedItems.length) return

  const client = getStockClient(tx)

  for (const item of groupedItems) {
    if (item.variantId) {
      await client.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      })
      continue
    }

    await client.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }
}

export async function restoreStock(orderId: string, tx?: StockClient): Promise<void> {
  const client = getStockClient(tx)

  const order = await client.order.findUnique({
    where: { id: orderId },
    select: {
      items: {
        select: { productId: true, variantId: true, quantity: true },
      },
    },
  })

  if (!order?.items.length) return

  await restoreStockItems(order.items, client)
}
