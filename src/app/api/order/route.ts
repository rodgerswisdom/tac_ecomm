import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getEmailConfig } from '@/lib/email'
import { EmailService } from '@/lib/email'
import { PaymentService, getPaymentConfig } from '@/lib/payments'
import { convertFromUsd } from '@/lib/currency'
import type { CurrencyCode } from '@/lib/currency'

export async function POST(req: NextRequest) {
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

  // Total is subtotal minus any coupon (no shipping or duty/tax). All order amounts are stored in USD (product prices are USD).
  const shipping = 0
  const tax = 0
  const total = subtotal - (couponDiscount || 0)
  const orderCurrency = 'USD' as const
  const defaultPaymentCurrency = (process.env.DEFAULT_CURRENCY || 'USD').toUpperCase()
  // For Pesapal we may charge in local currency (e.g. KES); convert order total (USD) to that currency for the gateway.
  const payCurrencyCode: CurrencyCode = defaultPaymentCurrency === 'KES' || defaultPaymentCurrency === 'KSH' ? 'KSH' : defaultPaymentCurrency === 'EUR' ? 'EUR' : 'USD'
  const paymentAmount = payCurrencyCode === 'USD' ? total : Math.round(convertFromUsd(total, payCurrencyCode))
  const paymentCurrency = payCurrencyCode === 'KSH' ? 'KES' : payCurrencyCode
  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod)

  // Optionally: validate coupon here (not implemented)


  // Generate unique order number
  function generateOrderNumber() {
    const now = Date.now()
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `TAC${now}${rand}`
  }
  const orderNumber = generateOrderNumber()

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
      currency: orderCurrency,
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

    try {
      const paymentResponse = await paymentService.createPayment('pesapal', {
        amount: paymentAmount,
        currency: paymentCurrency,
        orderId: order.orderNumber,
        customerEmail: emailTrim,
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
          currency: paymentCurrency,
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

  if (couponCode) {
    try {
      await prisma.coupon.update({
        where: { code: couponCode },
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
      ...(couponCode && { couponCode, couponDiscount: couponDiscount ?? 0 })
    })
  } catch (err) {
    console.error('Order confirmation email failed:', err)
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
