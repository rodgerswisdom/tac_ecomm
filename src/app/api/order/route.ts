import { NextRequest, NextResponse } from 'next/server'
import { CouponType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  calculateShippingKsh,
  isDeliveryMethod,
  isDeliveryMethodValidForCountry,
  CUSTOMER_ARRANGED_DELIVERY,
  PICKUP_LOCATION,
  type DeliveryMethod,
} from '@/lib/delivery'
import { checkCheckoutRateLimit, passesCsrfProtection } from '@/lib/request-security'
import { formatProductImageLabel } from '@/lib/product-image-selection'
import { PAYMENT_WINDOW_MS, startPaystackPayment } from '@/lib/paystack'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type CheckoutCartItem = {
  id: string
  variantId?: string | null
  productImageId?: string | null
  selectedImageLabel?: string | null
  image?: string | null
  name: string
  price: number
  quantity: number
}

type ValidatedOrderItem = {
  productId: string
  variantId?: string | null
  productImageId?: string | null
  selectedImageUrl?: string | null
  selectedImageLabel?: string | null
  quantity: number
  price: number
  name: string
  sku: string
}

export async function POST(req: NextRequest) {
  if (!passesCsrfProtection(req)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  const session = await auth()
  const body = await req.json()
  const {
    firstName, lastName, email, phone, address, apartment, city, postalCode, country,
    shippingMethod, cartItems: clientCartItems,
    couponCode, marketingOptIn, deliveryInstructions
  } = body

  // "Arrange your own delivery" needs the customer's instructions; other methods ignore them.
  const isCustomerArranged = shippingMethod === 'customer_arranged'
  const deliveryInstructionsTrim = isCustomerArranged ? String(deliveryInstructions ?? '').trim() : ''
  if (isCustomerArranged && !deliveryInstructionsTrim) {
    return NextResponse.json({ error: 'Tell us how you would like your order delivered.' }, { status: 400 })
  }
  if (deliveryInstructionsTrim.length > CUSTOMER_ARRANGED_DELIVERY.instructionsMaxLength) {
    return NextResponse.json(
      { error: `Delivery instructions must be ${CUSTOMER_ARRANGED_DELIVERY.instructionsMaxLength} characters or fewer.` },
      { status: 400 }
    )
  }

  // Pickup orders are collected at PICKUP_LOCATION, so no delivery address is needed.
  const isPickup = shippingMethod === 'pickup'
  const required = isPickup
    ? { firstName, lastName, email, phone }
    : { firstName, lastName, email, phone, address, city, country }
  for (const [key, value] of Object.entries(required)) {
    if (value == null || String(value).trim() === '') {
      return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 })
    }
  }
  const emailTrim = String(email).trim()
  if (!EMAIL_PATTERN.test(emailTrim)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  const rateLimit = checkCheckoutRateLimit(req, emailTrim)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const firstNameTrim = String(firstName).trim()
  const lastNameTrim = String(lastName).trim()
  const phoneTrim = String(phone).trim()
  const optionalTrim = (value: unknown) => (value != null ? String(value).trim() : '')
  // For pickup, the "address" on the order is the pickup point, so fulfilment sees where it goes.
  const addressTrim = isPickup ? `Pickup — ${PICKUP_LOCATION.address}` : String(address).trim()
  const apartmentTrim = isPickup ? '' : optionalTrim(apartment)
  const cityTrim = isPickup ? PICKUP_LOCATION.city : String(city).trim()
  const postalCodeTrim = isPickup ? '' : optionalTrim(postalCode)
  const countryTrim = isPickup ? PICKUP_LOCATION.country : String(country).trim()

  // Fetch cart for logged-in user from DB, else use clientCartItems for guest
  let cartItems: CheckoutCartItem[] = []
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' } },
              },
            },
            productImage: true,
          },
        },
      },
    })
    if (!user || !user.cart?.length) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }
    cartItems = user.cart.map((item) => {
      const imageIndex = item.productImageId
        ? item.product.images.findIndex((image) => image.id === item.productImageId)
        : -1
      const selectedImageLabel =
        item.productImageId && imageIndex >= 0
          ? formatProductImageLabel(
              {
                id: item.product.images[imageIndex].id,
                url: item.product.images[imageIndex].url,
                alt: item.product.images[imageIndex].alt ?? undefined,
                order: item.product.images[imageIndex].order,
              },
              imageIndex,
            )
          : null

      return {
        id: item.productId,
        variantId: item.variantId ?? null,
        productImageId: item.productImageId ?? null,
        selectedImageLabel,
        image: item.productImage?.url ?? null,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }
    })
  } else {
    const items = Array.isArray(clientCartItems) ? clientCartItems : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    cartItems = items.map((item: {
      id: string | number
      productId?: string | number
      variantId?: string
      productImageId?: string
      selectedImageLabel?: string
      image?: string
      name?: string
      price?: number
      quantity?: number
    }) => ({
      id: String(item.productId ?? item.id),
      variantId: item.variantId ?? null,
      productImageId: item.productImageId ?? null,
      selectedImageLabel: item.selectedImageLabel ?? null,
      image: item.image ?? null,
      name: item.name ?? '',
      price: Number(item.price) ?? 0,
      quantity: Number(item.quantity) || 1,
    }))
  }

  // Validate cart items: product exists, active, and in stock
  let subtotal = 0
  const validatedItems: ValidatedOrderItem[] = []
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

    let productImageId: string | null = item.productImageId ?? null
    let selectedImageUrl: string | null = item.image ?? null
    let selectedImageLabel: string | null = item.selectedImageLabel ?? null

    if (productImageId) {
      const productImage = await prisma.productImage.findFirst({
        where: { id: productImageId, productId: product.id },
      })
      if (!productImage) {
        return NextResponse.json({ error: `Selected image unavailable for: ${product.name}` }, { status: 400 })
      }
      selectedImageUrl = productImage.url
      if (!selectedImageLabel) {
        const images = await prisma.productImage.findMany({
          where: { productId: product.id },
          orderBy: { order: 'asc' },
        })
        const imageIndex = images.findIndex((image) => image.id === productImageId)
        if (imageIndex >= 0) {
          selectedImageLabel = formatProductImageLabel(
            {
              id: images[imageIndex].id,
              url: images[imageIndex].url,
              alt: images[imageIndex].alt ?? undefined,
              order: images[imageIndex].order,
            },
            imageIndex,
          )
        }
      }
    }

    validatedItems.push({
      productId: product.id,
      variantId: item.variantId ?? null,
      productImageId,
      selectedImageUrl,
      selectedImageLabel,
      quantity: qty,
      price,
      name: product.name,
      sku: product.sku,
    })
  }

  // Merchandise subtotal (KSH) before coupon — used for Kenya free-shipping threshold.
  const shippingMethodRaw = typeof shippingMethod === 'string' ? shippingMethod.trim() : ''
  if (!isDeliveryMethod(shippingMethodRaw)) {
    return NextResponse.json({ error: 'Invalid delivery method.' }, { status: 400 })
  }
  const deliveryMethod = shippingMethodRaw as DeliveryMethod
  if (!isDeliveryMethodValidForCountry(deliveryMethod, countryTrim)) {
    return NextResponse.json(
      { error: 'Selected delivery method is not available for this destination.' },
      { status: 400 }
    )
  }

  let couponDiscountKsh = 0
  let couponGrantsFreeShipping = false
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
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      couponGrantsFreeShipping = true
    }
    couponDiscountKsh = Math.max(0, Math.min(couponDiscountKsh, subtotal))
    appliedCoupon = { id: coupon.id, code: coupon.code }
  }

  const shippingQuote = calculateShippingKsh({
    country: countryTrim,
    deliveryMethod,
    merchandiseSubtotalKsh: subtotal,
    freeShippingFromCoupon: couponGrantsFreeShipping,
  })
  const shipping = shippingQuote.shippingKsh
  const tax = 0
  const total = Math.max(0, subtotal - couponDiscountKsh + shipping)
  const orderCurrency = 'KSH' as const

  if (total <= 0) {
    return NextResponse.json({ error: 'Order total must be greater than zero.' }, { status: 400 })
  }

  console.info(
    '[order] subtotal (KSH):',
    subtotal,
    'couponDiscount (KSH):',
    couponDiscountKsh,
    'shipping (KSH):',
    shipping,
    'total (KSH):',
    total,
    appliedCoupon ? `(coupon: ${appliedCoupon.code})` : '(no coupon)'
  )

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

  // "Email me with news and offers" — opt-in only; leaving it unticked never unsubscribes anyone.
  if (marketingOptIn === true) {
    await prisma.newsletter
      .upsert({
        where: { email: user.email },
        create: { email: user.email },
        update: { isActive: true },
      })
      .catch((error) => console.error('[order] newsletter opt-in failed', error))
  }

  // Create shipping address
  const shippingAddress = await prisma.address.create({
    data: {
      firstName: firstNameTrim,
      lastName: lastNameTrim,
      address1: addressTrim,
      address2: apartmentTrim || null,
      city: cityTrim,
      state: '',
      postalCode: postalCodeTrim,
      country: countryTrim,
      phone: phoneTrim,
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
      paymentMethod: PaymentMethod.PAYSTACK,
      paymentStatus: PaymentStatus.PENDING,
      paymentAttempt: 1,
      paymentExpiresAt: new Date(Date.now() + PAYMENT_WINDOW_MS),
      status: OrderStatus.PENDING,
      shippingMethod: deliveryMethod,
      deliveryInstructions: deliveryInstructionsTrim || null,
      couponCode: appliedCoupon?.code ?? null,
      couponDiscount: appliedCoupon ? couponDiscountKsh : null,
      items: {
        create: validatedItems.map(({ productId, variantId, quantity, price, productImageId, selectedImageUrl, selectedImageLabel, name, sku }) => ({
          productId,
          productName: name,
          productSku: sku,
          variantId: variantId ?? undefined,
          quantity,
          price,
          productImageId: productImageId ?? undefined,
          selectedImageUrl: selectedImageUrl ?? undefined,
          selectedImageLabel: selectedImageLabel ?? undefined,
        }))
      }
    }
  })

  const baseUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin).replace(/\/$/, '')
  let authorizationUrl: string
  try {
    authorizationUrl = await startPaystackPayment({
      order,
      email: user.email,
      attempt: 1,
      baseUrl,
      metadata: {
        customerName: `${firstNameTrim} ${lastNameTrim}`.trim(),
        phone: phoneTrim,
      },
    })
  } catch (error) {
    console.error('[order] Paystack initialization failed', error)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED
      }
    })
    return NextResponse.json(
      { error: 'We could not start the payment. Please try again.' },
      { status: 502 }
    )
  }

  // Stock is decremented, coupon usage counted and the ops team notified only when
  // Paystack confirms payment (see confirmPaystackPayment in src/lib/paystack.ts).
  return NextResponse.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    redirectUrl: authorizationUrl
  })
}
