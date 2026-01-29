
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  const body = await req.json()
  // Extract all order details from body
  const {
    email, firstName, lastName, phone, address, city, state, zipCode, country,
    paymentMethod, shippingMethod, cartItems: clientCartItems,
    couponCode, couponDiscount, couponType
  } = body

  // Fetch cart for logged-in user from DB, else use clientCartItems for guest
  let cartItems = []
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: { include: { product: true } } }
    })
    if (!user || !user.cart) {
      return NextResponse.json({ error: 'No cart found for user' }, { status: 400 })
    }
    cartItems = user.cart.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      product: item.product
    }))
  } else {
    // Guest: use cart from request
    cartItems = Array.isArray(clientCartItems) ? clientCartItems : []
  }

  // Validate cart items: check product exists, price, and stock
  let subtotal = 0
  const validatedItems = []
  for (const item of cartItems) {
    const product = await prisma.product.findUnique({ where: { id: item.id } })
    if (!product || !product.isActive || product.stock < (item.quantity || 1)) {
      return NextResponse.json({ error: `Product unavailable: ${item.name || item.id}` }, { status: 400 })
    }
    const price = product.price
    subtotal += price * (item.quantity || 1)
    validatedItems.push({
      productId: product.id,
      quantity: item.quantity || 1,
      price
    })
  }

  // Calculate shipping and tax (re-calculate for security)
  const shipping = shippingMethod === 'express' ? 25 : shippingMethod === 'standard' ? 15 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax - (couponDiscount || 0)

  // Optionally: validate coupon here (not implemented)


  // Create or find user (optional, for guest checkout just use email)
  // Create shipping address
  const shippingAddressData: any = {
    firstName,
    lastName,
    address1: address,
    city,
    state,
    postalCode: zipCode,
    country,
    phone,
    user: {
      connectOrCreate: {
        where: { email },
        create: { email, name: `${firstName} ${lastName}` }
      }
    }
  }

  // Generate a unique order number (e.g., TAC + timestamp + random 4 digits)
  function generateOrderNumber() {
    const now = Date.now();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TAC${now}${rand}`;
  }
  const orderNumber = generateOrderNumber();

  const shippingAddress = await prisma.address.create({
    data: shippingAddressData
  })

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      shippingAddressId: shippingAddress.id,
      subtotal, tax, shipping, total,
      paymentMethod, status: 'PENDING',
      items: {
        create: validatedItems
      },
      couponCode,
      couponDiscount,
      couponType,
      ...(email && {
        user: {
          connectOrCreate: {
            where: { email },
            create: { email, name: `${firstName} ${lastName}` }
          }
        }
      })
    }
  })

  // Optionally increment coupon usage
  if (couponCode) {
    await prisma.coupon.update({
      where: { code: couponCode },
      data: { usedCount: { increment: 1 } }
    })
  }

  return NextResponse.json({ success: true, orderId: order.id })
}
