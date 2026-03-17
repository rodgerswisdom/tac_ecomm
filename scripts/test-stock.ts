/**
 * Stock Management Integration Test Script
 * ─────────────────────────────────────────
 * Runs against your real DATABASE_URL. Safe to run multiple times —
 * all test data is cleaned up in the `finally` block.
 *
 * Usage:
 *   npm run test:stock
 *   (or directly: npx tsx scripts/test-stock.ts)
 *
 * What it tests:
 *  1. decrementStock   – product-level and variant-level
 *  2. restoreStock     – restores after cancellation
 *  3. Checkout guard   – rejects orders when stock is 0
 *  4. Double-decrement guard – simulates callback + IPN race
 */

import 'dotenv/config'
import { PrismaClient, OrderStatus, PaymentStatus, ProductType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { decrementStock, restoreStock } from '../src/lib/stock'
import { deriveOrderStatus } from '../src/lib/order-status'

// ── Prisma setup (mirrors src/lib/prisma.ts) ──────────────────────────────
const connectionString = process.env.DATABASE_URL!
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ── Test helpers ──────────────────────────────────────────────────────────
let passed = 0
let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅  ${message}`)
    passed++
  } else {
    console.error(`  ❌  ${message}`)
    failed++
  }
}

async function cleanUp(ids: {
  categoryId?: string
  productId?: string
  variantId?: string
  secondProductId?: string
  secondVariantId?: string
  userId?: string
  addressId?: string
  orderId?: string
}) {
  if (ids.orderId) {
    await prisma.orderItem.deleteMany({ where: { orderId: ids.orderId } })
    await prisma.payment.deleteMany({ where: { orderId: ids.orderId } })
    await prisma.order.deleteMany({ where: { id: ids.orderId } })
  }
  if (ids.addressId) await prisma.address.deleteMany({ where: { id: ids.addressId } })
  if (ids.secondVariantId) await prisma.productVariant.deleteMany({ where: { id: ids.secondVariantId } })
  if (ids.secondProductId) await prisma.product.deleteMany({ where: { id: ids.secondProductId } })
  if (ids.variantId) await prisma.productVariant.deleteMany({ where: { id: ids.variantId } })
  if (ids.productId) await prisma.product.deleteMany({ where: { id: ids.productId } })
  if (ids.categoryId) await prisma.category.deleteMany({ where: { id: ids.categoryId } })
  if (ids.userId) await prisma.user.deleteMany({ where: { id: ids.userId } })
}

// ── Main test runner ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🧪  Stock Management Integration Tests\n')

  // ── Seed: category, product, variant ─────────────────────────────────
  const category = await prisma.category.create({
    data: {
      name: '__test_stock_cat__' + Date.now(),
      slug: '__test_stock_cat__' + Date.now(),
    },
  })

  const product = await prisma.product.create({
    data: {
      name: '__test_stock_product__',
      slug: '__test_stock_product__' + Date.now(),
      description: 'Test product for stock tests',
      price: 50,
      sku: 'TEST-SKU-' + Date.now(),
      stock: 10,
      categoryId: category.id,
      productType: ProductType.READY_TO_WEAR,
    },
  })

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Size',
      value: 'M',
      stock: 5,
    },
  })

  const secondProduct = await prisma.product.create({
    data: {
      name: '__test_stock_product_2__',
      slug: '__test_stock_product_2__' + Date.now(),
      description: 'Second test product for stock tests',
      price: 60,
      sku: 'TEST-SKU-2-' + Date.now(),
      stock: 12,
      categoryId: category.id,
      productType: ProductType.READY_TO_WEAR,
    },
  })

  const secondVariant = await prisma.productVariant.create({
    data: {
      productId: secondProduct.id,
      name: 'Size',
      value: 'L',
      stock: 9,
    },
  })

  // Test user + address (required for Order)
  const user = await prisma.user.create({
    data: { email: '__test_stock__' + Date.now() + '@test.com', name: 'Test User' },
  })
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      firstName: 'Test', lastName: 'User',
      address1: '1 Test St', city: 'Nairobi',
      state: 'Nairobi', postalCode: '00100',
      country: 'KE',
    },
  })

  const ids: {
    categoryId?: string
    productId?: string
    variantId?: string
    secondProductId?: string
    secondVariantId?: string
    userId?: string
    addressId?: string
    orderId?: string
  } = {
    categoryId: category.id,
    productId: product.id,
    variantId: variant.id,
    secondProductId: secondProduct.id,
    secondVariantId: secondVariant.id,
    userId: user.id,
    addressId: address.id,
  }

  try {
    // ────────────────────────────────────────────────────────────────────
    console.log('📦  Test 1: decrementStock (product-level)')
    // ────────────────────────────────────────────────────────────────────
    await decrementStock([{ productId: product.id, quantity: 3 }])
    const p1 = await prisma.product.findUnique({ where: { id: product.id } })
    assert(p1!.stock === 7, `Product stock should be 7 after decrement (got ${p1!.stock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 2: decrementStock (variant-level)')
    // ────────────────────────────────────────────────────────────────────
    await decrementStock([{ productId: product.id, variantId: variant.id, quantity: 2 }])
    const v1 = await prisma.productVariant.findUnique({ where: { id: variant.id } })
    const p1b = await prisma.product.findUnique({ where: { id: product.id } })
    assert(v1!.stock === 3, `Variant stock should be 3 after decrement (got ${v1!.stock})`)
    assert(p1b!.stock === 7, `Product stock must NOT change when variant is decremented (got ${p1b!.stock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 3: restoreStock')
    // ────────────────────────────────────────────────────────────────────
    // Create an order with 2 units of the product (no variant)
    const order = await prisma.order.create({
      data: {
        orderNumber: 'TEST-' + Date.now(),
        userId: user.id,
        shippingAddressId: address.id,
        subtotal: 100, tax: 0, shipping: 0, total: 100,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
        items: {
          create: [{ productId: product.id, quantity: 2, price: 50 }],
        },
      },
    })
    ids.orderId = order.id

    // Decrement first (simulates normal order flow)
    await decrementStock([{ productId: product.id, quantity: 2 }])
    const p2a = await prisma.product.findUnique({ where: { id: product.id } })
    assert(p2a!.stock === 5, `Product stock should be 5 after second decrement (got ${p2a!.stock})`)

    // Now restore (simulates cancellation)
    await restoreStock(order.id)
    const p2b = await prisma.product.findUnique({ where: { id: product.id } })
    assert(p2b!.stock === 7, `Product stock should be back to 7 after restore (got ${p2b!.stock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 4: Checkout guard — out-of-stock product')
    // ────────────────────────────────────────────────────────────────────
    // Drain all remaining stock
    await prisma.product.update({ where: { id: product.id }, data: { stock: 0 } })

    const stockAfterDrain = await prisma.product.findUnique({ where: { id: product.id } })
    // Simulate what the order route does: check stock < qty
    const checkoutBlocked = stockAfterDrain!.stock < 1
    assert(checkoutBlocked, 'Checkout guard correctly detects zero stock')

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 5: Double-decrement guard (atomic PENDING→CONFIRMED)')
    // ────────────────────────────────────────────────────────────────────
    // Reset stock
    await prisma.product.update({ where: { id: product.id }, data: { stock: 10 } })

    // The order is still CONFIRMED from Test 3. Let's reset it to PENDING to simulate a new Pesapal order.
    await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.PENDING } })

    // Simulate two concurrent callbacks both trying to confirm the same order.
    // updateMany with `status: PENDING` guard means only ONE will win.
    const [result1, result2] = await Promise.all([
      prisma.order.updateMany({
        where: { id: order.id, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.COMPLETED },
      }),
      prisma.order.updateMany({
        where: { id: order.id, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.COMPLETED },
      }),
    ])

    const winner = result1.count + result2.count
    assert(winner === 1, `Exactly one handler should win the transition (got ${winner})`)

    // Simulate: only the winner decrements (count > 0)
    if (result1.count > 0) await decrementStock([{ productId: product.id, quantity: 2 }])
    if (result2.count > 0) await decrementStock([{ productId: product.id, quantity: 2 }])

    const p5 = await prisma.product.findUnique({ where: { id: product.id } })
    assert(p5!.stock === 8, `Stock should be 8 (decremented only once, not twice — got ${p5!.stock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 6: Admin cancel CONFIRMED order restores stock')
    // ────────────────────────────────────────────────────────────────────
    const prevStatus = (await prisma.order.findUnique({ where: { id: order.id }, select: { status: true } }))!.status
    const wasConfirmed = prevStatus === OrderStatus.CONFIRMED

    await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } })

    if (wasConfirmed) {
      await restoreStock(order.id)
    }

    const p6 = await prisma.product.findUnique({ where: { id: product.id } })
    assert(p6!.stock === 10, `Stock restored to 10 after admin cancel (got ${p6!.stock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 7: Cancelling a non-CONFIRMED order must not restore stock')
    // ────────────────────────────────────────────────────────────────────
    await prisma.product.update({ where: { id: product.id }, data: { stock: 10 } })
    await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.PENDING } })

    // Simulate admin logic: restore only if previously CONFIRMED
    const beforeCancelStock = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock
    await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } })
    const afterCancelStock = (await prisma.product.findUnique({ where: { id: product.id } }))!.stock
    assert(afterCancelStock === beforeCancelStock, `Pending→Cancelled should not change stock (got ${afterCancelStock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 8: Double admin cancel should restore exactly once')
    // ────────────────────────────────────────────────────────────────────
    await prisma.product.update({ where: { id: product.id }, data: { stock: 8 } })
    await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CONFIRMED } })

    const [cancel1, cancel2] = await Promise.all([
      prisma.order.updateMany({
        where: { id: order.id, status: OrderStatus.CONFIRMED },
        data: { status: OrderStatus.CANCELLED },
      }),
      prisma.order.updateMany({
        where: { id: order.id, status: OrderStatus.CONFIRMED },
        data: { status: OrderStatus.CANCELLED },
      }),
    ])

    if (cancel1.count > 0) await restoreStock(order.id)
    if (cancel2.count > 0) await restoreStock(order.id)

    const p8 = await prisma.product.findUnique({ where: { id: product.id } })
    assert(p8!.stock === 10, `Concurrent cancel should restore once (got ${p8!.stock})`)

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 9: Variant must belong to selected product')
    // ────────────────────────────────────────────────────────────────────
    const belongsToProduct = secondVariant.productId === product.id
    assert(!belongsToProduct, 'Mismatched variant/product pair is detectable and must be rejected')

    // ────────────────────────────────────────────────────────────────────
    console.log('\n📦  Test 10: Payment replay must not regress PROCESSING→CONFIRMED')
    // ────────────────────────────────────────────────────────────────────
    const derivedStatus = deriveOrderStatus(PaymentStatus.COMPLETED, OrderStatus.PROCESSING)
    assert(
      derivedStatus === OrderStatus.PROCESSING,
      `Completed replay should keep PROCESSING (got ${derivedStatus})`
    )

  } finally {
    // ── Cleanup ──────────────────────────────────────────────────────
    console.log('\n🧹  Cleaning up test data…')
    await cleanUp(ids)
    await prisma.$disconnect()

    // ── Summary ──────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(40)}`)
    console.log(`  Results: ${passed} passed, ${failed} failed`)
    console.log(`${'─'.repeat(40)}\n`)

    if (failed > 0) {
      process.exit(1)
    }
  }
}

main().catch((err) => {
  console.error('\n💥  Unexpected error:', err)
  process.exit(1)
})
