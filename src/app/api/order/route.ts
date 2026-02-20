import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getEmailConfig } from '@/lib/email'
import { EmailService } from '@/lib/email'
import { PaymentService, getPaymentConfig } from '@/lib/payments'

export async function POST(req: NextRequest) {
  const session = await auth()
  const body = await req.json()
  const {
    email, firstName, lastName, phone, address, city, state, zipCode, country,
    paymentMethod, shippingMethod, cartItems: clientCartItems,
    couponCode, couponDiscount: _couponDiscount
  } = body

  // Client-provided coupon discount is ignored; validation is server-side
  void _couponDiscount

  // Require email and shipping fields (Order requires userId from user)
  const required = { email, firstName, lastName, address, city, state, zipCode, country }
  for (const [key, value] of Object.entries(required)) {
    if (value == null || String(value).trim() === '') {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 })
    }
  }
  const emailTrim = String(email).trim()
  const firstNameTrim = String(firstName).trim()
  const lastNameTrim = String(lastName).trim()
  const addressTrim = String(address).trim()
  const cityTrim = String(city).trim()
  const stateTrim = String(state).trim()
  const zipCodeTrim = String(zipCode).trim()
  const countryTrim = String(country).trim()

  // Fetch cart for logged-in user from DB, else use clientCartItems for guest
  let cartItems: Array<{ id: string; name: string; price: number; quantity: number }> = []
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: { include: { product: true } } }
    })
    if (!user || !user.cart?.length) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }
    cartItems = user.cart.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }))
  } else {
    const items = Array.isArray(clientCartItems) ? clientCartItems : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    cartItems = items.map((item: { id: string | number; name?: string; price?: number; quantity?: number }) => ({
      id: String(item.id),
      name: item.name ?? '',
      price: Number(item.price) ?? 0,
      quantity: Number(item.quantity) || 1
    }))
  }

  // Validate cart items: product exists, active, and in stock (product id as string)
  let subtotal = 0
  const validatedItems: Array<{ productId: string; quantity: number; price: number; name: string }> = []
  for (const item of cartItems) {
    const productId = String(item.id)
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.isActive || product.stock < (item.quantity || 1)) {
      return NextResponse.json({ error: `Product unavailable: ${item.name || item.id}` }, { status: 400 })
    }
    const price = product.price
    subtotal += price * (item.quantity || 1)
    validatedItems.push({
      productId: product.id,
      quantity: item.quantity || 1,
      price,
      name: product.name
    })
  }

  // Calculate shipping and tax (re-calculate for security)
  // Temporarily zero out shipping charges; pricing to be reintroduced later
  let shipping = 0
  const tax = subtotal * 0.08
  let couponDiscount = 0

  // Validate coupon server-side (ignore client-provided discount)
  let appliedCouponCode: string | undefined
  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase()
    const coupon = await prisma.coupon.findUnique({ where: { code } })
    const now = new Date()

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Coupon is invalid or inactive' }, { status: 400 })
    }
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ error: 'Coupon is not yet active' }, { status: 400 })
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }
    if (coupon.minAmount != null && subtotal < coupon.minAmount) {
      return NextResponse.json({ error: `Order must be at least ${coupon.minAmount} to use this coupon` }, { status: 400 })
    }

    switch (coupon.type) {
      case 'PERCENTAGE': {
        couponDiscount = subtotal * (coupon.value / 100)
        break
      }
      case 'FIXED_AMOUNT': {
        couponDiscount = coupon.value
        break
      }
      case 'FREE_SHIPPING': {
        shipping = 0
        couponDiscount = 0
        break
      }
      default:
        couponDiscount = 0
    }

    const maxDiscountable = subtotal + shipping + tax
    couponDiscount = Math.min(Math.max(couponDiscount, 0), maxDiscountable)
    appliedCouponCode = code
  }

  const total = subtotal + shipping + tax - (couponDiscount || 0 )
  const currencyCode = (process.env.DEFAULT_CURRENCY || 'KSH').toUpperCase()
  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod)

  // Generate sequential atomic order number (e.g., TAC01)
  async function generateOrderNumber() {
    try {
      // Ensure sequence exists (one-time setup or safe check)
      await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1`)

      // Fetch next value atomically
      const result = await prisma.$queryRawUnsafe<{ nextval: bigint }[]>(`SELECT nextval('order_number_seq')`)
      const nextId = Number(result[0].nextval)

      // Pad to at least 2 digits (e.g., 1 -> 01, 10 -> 10)
      const paddedNumber = nextId.toString().padStart(2, '0')
      return `TAC${paddedNumber}`
    } catch (err) {
      console.error('Failed to generate atomic order number, falling back to count:', err)
      const count = await prisma.order.count()
      return `TAC${(count + 1).toString().padStart(2, '0')}`
    }
  }
  const orderNumber = await generateOrderNumber()

  // Get or create user (Order and Address require userId)
  const user = await prisma.user.upsert({
    where: { email: emailTrim },
    create: { email: emailTrim, name: `${firstNameTrim} ${lastNameTrim}` },
    update: {}
  })

  // Create shipping address
  const shippingAddress = await prisma.address.create({
    data: {
      firstName: firstNameTrim,
      lastName: lastNameTrim,
      address1: addressTrim,
      city: cityTrim,
      state: stateTrim,
      postalCode: zipCodeTrim,
      country: countryTrim,
      phone: phone != null && String(phone).trim() !== '' ? String(phone).trim() : null,
      userId: user.id
    }
  })

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      shippingAddressId: shippingAddress.id,
      userId: user.id,
      subtotal,
      tax,
      shipping,
      total,
      currency: currencyCode,
      paymentMethod: normalizedPaymentMethod,
      status: 'PENDING',
      shippingMethod: shippingMethod ?? null,
      items: {
        create: validatedItems.map(({ productId, quantity, price }) => ({
          productId,
          quantity,
          price
        }))
      }
    }
  })

  let redirectUrl: string | undefined

  if (normalizedPaymentMethod === PaymentMethod.PESAPAL) {
    const paymentService = new PaymentService(getPaymentConfig())
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin
    const callbackUrl = new URL('/api/payment/pesapal/callback', baseUrl)
    callbackUrl.searchParams.set('orderId', order.id)
    callbackUrl.searchParams.set('merchantReference', order.orderNumber)

    const cancelUrl = new URL('/checkout/cancel', baseUrl)
    cancelUrl.searchParams.set('orderId', order.id)
    cancelUrl.searchParams.set('orderNumber', order.orderNumber)

    try {
      const paymentResponse = await paymentService.createPayment('pesapal', {
        amount: total,
        currency: currencyCode,
        orderId: order.orderNumber,
        customerEmail: emailTrim,
        customerName: `${firstNameTrim} ${lastNameTrim}`.trim(),
        customerPhone: phone != null && String(phone).trim() !== '' ? String(phone).trim() : undefined,
        description: `Order ${order.orderNumber}`,
        returnUrl: callbackUrl.toString(),
        cancelUrl: cancelUrl.toString(),
        billingAddress: {
          line1: addressTrim,
          city: cityTrim,
          state: stateTrim,
          postalCode: zipCodeTrim,
          countryCode: countryTrim
        }
      })

      if (!paymentResponse.success || !paymentResponse.redirectUrl || !paymentResponse.paymentId) {
        throw new Error(paymentResponse.error || 'Pesapal did not return a redirect URL')
      }

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          currency: currencyCode,
          method: PaymentMethod.PESAPAL,
          status: PaymentStatus.PENDING,
          transactionId: paymentResponse.paymentId,
          gatewayResponse: JSON.stringify({ redirectUrl: paymentResponse.redirectUrl })
        }
      })

      redirectUrl = paymentResponse.redirectUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pesapal payment failed'
      console.error('Pesapal payment initialization failed', error)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED
        }
      })

      return NextResponse.json(
        { error: message || 'Failed to initiate Pesapal payment. Please try again.' },
        { status: 502 }
      )
    }
  }

  if (appliedCouponCode) {
    try {
      await prisma.coupon.update({
        where: { code: appliedCouponCode },
        data: { usedCount: { increment: 1 } }
      })
    } catch {
      // Ignore coupon update errors
    }
  }

  // Send order confirmation email (do not fail the request if email fails)
  try {
    const emailService = new EmailService(getEmailConfig())
    await emailService.sendOrderConfirmation({
      customerName: `${firstNameTrim} ${lastNameTrim}`,
      customerEmail: emailTrim,
      orderNumber,
      orderDate: new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      items: validatedItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: {
        name: `${firstNameTrim} ${lastNameTrim}`,
        address: addressTrim,
        city: cityTrim,
        state: stateTrim,
        zipCode: zipCodeTrim,
        country: countryTrim
      },
      ...(appliedCouponCode && { couponCode: appliedCouponCode, couponDiscount: couponDiscount ?? 0 })
    })
  } catch (err) {
    console.error('Order confirmation email failed:', err)
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    redirectUrl,
    ...(appliedCouponCode ? { couponCode: appliedCouponCode, couponDiscount } : {})
  })
}

const methodMap: Record<string, PaymentMethod> = {
  PAYPAL: PaymentMethod.PAYPAL,
  PESAPAL: PaymentMethod.PESAPAL,
  MPESA: PaymentMethod.PESAPAL,
  CREDIT_CARD: PaymentMethod.CREDIT_CARD,
  CARD: PaymentMethod.CREDIT_CARD,
  BANK_TRANSFER: PaymentMethod.BANK_TRANSFER
}

function normalizePaymentMethod(value: unknown): PaymentMethod | null {
  if (typeof value !== 'string') return null
  const upper = value.trim().toUpperCase()
  return methodMap[upper] ?? null
}
