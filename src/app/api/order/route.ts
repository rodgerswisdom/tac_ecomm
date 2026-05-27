import { NextRequest, NextResponse } from 'next/server'
import { CouponType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { PaymentService, getPaymentConfig } from '@/lib/payments'
import { convertFromUsd as convertFromBase, CurrencyCode } from '@/lib/currency'
import { checkCheckoutRateLimit, passesCsrfProtection } from '@/lib/request-security'
import { EmailService, getEmailConfig } from '@/lib/email'

export async function POST(req: NextRequest) {
  if (!passesCsrfProtection(req)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  const session = await auth()
  const body = await req.json()
  const {
    email, firstName, lastName, phone, address, city, state, zipCode, country,
    paymentMethod, shippingMethod, cartItems: clientCartItems,
    couponCode, couponDiscount
  } = body

  // Require email and shipping fields (Order requires userId from user)
  const required = { email, firstName, lastName, address, city, state, zipCode, country }
  for (const [key, value] of Object.entries(required)) {
    if (value == null || String(value).trim() === '') {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 })
    }
  }
  const emailTrim = String(email).trim()
  const rateLimit = checkCheckoutRateLimit(req, emailTrim)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const firstNameTrim = String(firstName).trim()
  const lastNameTrim = String(lastName).trim()
  const addressTrim = String(address).trim()
  const cityTrim = String(city).trim()
  const stateTrim = String(state).trim()
  const zipCodeTrim = String(zipCode).trim()
  const countryTrim = String(country).trim()

  // Fetch cart for logged-in user from DB, else use clientCartItems for guest
  let cartItems: Array<{ id: string; variantId?: string | null; name: string; price: number; quantity: number }> = []
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
      variantId: item.variantId ?? null,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }))
  } else {
    const items = Array.isArray(clientCartItems) ? clientCartItems : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    cartItems = items.map((item: { id: string | number; variantId?: string; name?: string; price?: number; quantity?: number }) => ({
      id: String(item.id),
      variantId: item.variantId ?? null,
      name: item.name ?? '',
      price: Number(item.price) ?? 0,
      quantity: Number(item.quantity) || 1
    }))
  }

  // Validate cart items: product exists, active, and in stock
  // When a variantId is present we check the variant's own stock; otherwise the product-level stock.
  let subtotal = 0
  const validatedItems: Array<{ productId: string; variantId?: string | null; quantity: number; price: number; name: string }> = []
  for (const item of cartItems) {
    const productId = String(item.id)
    const qty = item.quantity || 1
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: `Product unavailable: ${item.name || item.id}` }, { status: 400 })
    }

    if (item.variantId) {
      // Variant-level stock check
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } })
      if (!variant || variant.stock < qty) {
        return NextResponse.json({ error: `Variant unavailable or out of stock: ${product.name}` }, { status: 400 })
      }
      if (variant.productId !== product.id) {
        return NextResponse.json({ error: 'Invalid variant for this product' }, { status: 400 })
      }
    } else {
      // Product-level stock check
      if (product.stock < qty) {
        return NextResponse.json({ error: `Insufficient stock for: ${product.name}` }, { status: 400 })
      }
    }

    const price = product.price
    subtotal += price * qty
    validatedItems.push({
      productId: product.id,
      variantId: item.variantId ?? null,
      quantity: qty,
      price,
      name: product.name
    })
  }

  // Total is subtotal minus any coupon (no shipping or duty/tax). All order amounts are stored in KSH (product prices are KSH).
  const shipping = 0
  const tax = 0

  let couponDiscountKsh = 0
  let appliedCoupon: { id: string; code: string } | null = null
  const couponCodeRaw = typeof couponCode === 'string' ? couponCode.trim() : ''
  if (couponCodeRaw) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: { equals: couponCodeRaw, mode: 'insensitive' } }
    })
    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon.' }, { status: 400 })
    }
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'This coupon is no longer active.' }, { status: 400 })
    }
    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ error: 'This coupon is not yet valid.' }, { status: 400 })
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 })
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 })
    }
    if (coupon.minAmount != null && subtotal < coupon.minAmount) {
      return NextResponse.json({
        error: `Minimum order amount for this coupon is KES ${Math.round(coupon.minAmount).toLocaleString()}`
      }, { status: 400 })
    }
    if (coupon.type === CouponType.PERCENTAGE) {
      couponDiscountKsh = subtotal * (coupon.value / 100)
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      couponDiscountKsh = Math.min(coupon.value, subtotal)
    }
    couponDiscountKsh = Math.max(0, Math.min(couponDiscountKsh, subtotal))
    appliedCoupon = { id: coupon.id, code: coupon.code }
  }

  const total = Math.max(0, subtotal - couponDiscountKsh)
  const orderCurrency = 'KSH' as const
  const defaultPaymentCurrency = (process.env.DEFAULT_CURRENCY || 'KSH').toUpperCase()
  // For Pesapal we charge in KES (same as KSH base). For PayPal, convert KSH to USD.
  const payCurrencyCode: CurrencyCode = defaultPaymentCurrency === 'KES' || defaultPaymentCurrency === 'KSH' ? 'KSH' : defaultPaymentCurrency === 'EUR' ? 'EUR' : 'USD'
  const paymentAmount = payCurrencyCode === 'KSH' ? total : Math.round(convertFromBase(total, payCurrencyCode))
  const paymentCurrency = payCurrencyCode === 'KSH' ? 'KES' : payCurrencyCode
  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod)

  // Log order totals and payment amount so checkout display matches Pesapal (amount in KES).
  console.info('[order] subtotal (KSH):', subtotal, 'couponDiscount (KSH):', couponDiscountKsh, 'total (KSH):', total, '→ payment:', paymentAmount, paymentCurrency, appliedCoupon ? `(coupon: ${appliedCoupon.code})` : '(no coupon)')

  // Optionally: validate coupon here (not implemented)


  // Generate short unique order number: TAC-<base36 time>-<4 random>
  function generateOrderNumber() {
    const timePart = Date.now().toString(36).toUpperCase().slice(-8)
    const randPart = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `TAC-${timePart}-${randPart}`
  }
  const orderNumber = generateOrderNumber()

  // Resolve order owner:
  // - Authenticated checkout must stay tied to the signed-in user so payment callbacks
  //   clear the same user's DB cart.
  // - Guest checkout falls back to email-based upsert.
  let user: { id: string; email: string }
  if (session?.user?.email) {
    const sessionEmail = String(session.user.email).trim()
    const existingSessionUser = await prisma.user.findUnique({
      where: { email: sessionEmail },
      select: { id: true, email: true }
    })

    if (existingSessionUser) {
      user = existingSessionUser
    } else {
      user = await prisma.user.create({
        data: { email: sessionEmail, name: `${firstNameTrim} ${lastNameTrim}` },
        select: { id: true, email: true }
      })
    }
  } else {
    user = await prisma.user.upsert({
      where: { email: emailTrim },
      create: { email: emailTrim, name: `${firstNameTrim} ${lastNameTrim}` },
      update: {},
      select: { id: true, email: true }
    })
  }

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
      currency: orderCurrency,
      paymentMethod: normalizedPaymentMethod ?? undefined,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
      shippingMethod: shippingMethod ?? null,
      items: {
        create: validatedItems.map(({ productId, variantId, quantity, price }) => ({
          productId,
          variantId: variantId ?? undefined,
          quantity,
          price
        }))
      }
    }
  })

  let redirectUrl: string | undefined
  const opsEmails = [
    "info@tacaccessories.co.ke",
    "peter@tacaccessories.co.ke",
    "mary@tacaccessories.co.ke",
  ]
  const sendOpsNotification = async () => {
    const emailService = new EmailService(getEmailConfig())
    const subject = `New order received: ${order.orderNumber}`
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 12px 0;">New order received</h2>
        <p style="margin: 0 0 12px 0;"><strong>Order #:</strong> ${order.orderNumber}</p>
        <p style="margin: 0 0 12px 0;"><strong>Customer:</strong> ${firstNameTrim} ${lastNameTrim}</p>
        <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${emailTrim}</p>
        <p style="margin: 0 0 12px 0;"><strong>Phone:</strong> ${phone != null && String(phone).trim() !== "" ? String(phone).trim() : "Not provided"}</p>
        <p style="margin: 0 0 12px 0;"><strong>Total:</strong> KES ${Math.round(total).toLocaleString()}</p>
        <p style="margin: 0 0 12px 0;"><strong>Payment method:</strong> ${normalizedPaymentMethod ?? "Not specified"}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <p style="margin: 0 0 6px 0;"><strong>Shipping address</strong></p>
        <p style="margin: 0;">
          ${firstNameTrim} ${lastNameTrim}<br />
          ${addressTrim}<br />
          ${cityTrim}, ${stateTrim} ${zipCodeTrim}<br />
          ${countryTrim}
        </p>
      </div>
    `
    const text =
      `New order received\n\n` +
      `Order #: ${order.orderNumber}\n` +
      `Customer: ${firstNameTrim} ${lastNameTrim}\n` +
      `Email: ${emailTrim}\n` +
      `Phone: ${phone != null && String(phone).trim() !== "" ? String(phone).trim() : "Not provided"}\n` +
      `Total: KES ${Math.round(total).toLocaleString()}\n` +
      `Payment method: ${normalizedPaymentMethod ?? "Not specified"}\n\n` +
      `Shipping:\n` +
      `${firstNameTrim} ${lastNameTrim}\n` +
      `${addressTrim}\n` +
      `${cityTrim}, ${stateTrim} ${zipCodeTrim}\n` +
      `${countryTrim}\n`

    await Promise.all(
      opsEmails.map((to) => emailService.sendEmail({ to, subject, html, text }))
    )
  }

  if (normalizedPaymentMethod === PaymentMethod.PESAPAL) {
    const paymentService = new PaymentService(getPaymentConfig())
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin
    const callbackUrl = new URL('/api/payment/pesapal/callback', baseUrl)
    callbackUrl.searchParams.set('orderId', order.id)
    callbackUrl.searchParams.set('merchantReference', order.orderNumber)

    try {
      const paymentResponse = await paymentService.createPayment('pesapal', {
        amount: paymentAmount,
        currency: paymentCurrency,
        orderId: order.orderNumber,
        customerEmail: user.email,
        customerName: `${firstNameTrim} ${lastNameTrim}`.trim(),
        customerPhone: phone != null && String(phone).trim() !== '' ? String(phone).trim() : undefined,
        description: `Order ${order.orderNumber}`,
        returnUrl: callbackUrl.toString(),
        cancelUrl: `${baseUrl}/checkout`,
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
          amount: paymentAmount,
          currency: 'KES',
          method: PaymentMethod.PESAPAL,
          status: PaymentStatus.PENDING,
          transactionId: paymentResponse.paymentId,
          gatewayResponse: JSON.stringify({ redirectUrl: paymentResponse.redirectUrl })
        }
      })

      redirectUrl = paymentResponse.redirectUrl
      // Notify ops only once payment initialization succeeded (avoid false alarms on failed redirects).
      await sendOpsNotification()
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
  // Non-pesapal: order is created and ready immediately.
  if (normalizedPaymentMethod !== PaymentMethod.PESAPAL) {
    await sendOpsNotification()
  }

  // Stock is decremented only when payment is confirmed:
  // - Pesapal: callback/IPN handlers
  // - Other methods: admin transition to CONFIRMED

  if (appliedCoupon) {
    try {
      await prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usedCount: { increment: 1 } }
      })
    } catch {
      // Ignore coupon update errors
    }
  }
  return NextResponse.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    redirectUrl
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
