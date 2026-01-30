
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// GET /api/cart - fetch current user's cart (CartItems)
export async function GET() {
  const session = await auth()
  if (session?.user?.email) {
    // Authenticated user: fetch cart items from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: { include: { product: true } } }
    })
    if (!user) return NextResponse.json({ cart: [] }, { status: 200 })
    return NextResponse.json({ cart: user.cart || [] }, { status: 200 })
  } else {
    // Guest: use cookie/session (not implemented, fallback empty)
    return NextResponse.json({ cart: [] }, { status: 200 })
  }
}


// POST /api/cart - save/replace cart for current user
export async function POST(req: NextRequest) {
  const session = await auth()
  const { cartItems } = await req.json()
  if (session?.user?.email) {
    // Authenticated: replace all CartItems for user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    // Delete all existing cart items for user
    await prisma.cartItem.deleteMany({ where: { userId: user.id } })
    // Add new cart items
    for (const item of cartItems) {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId || null,
        }
      })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } else {
    // Guest: not supported (handled client-side)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
