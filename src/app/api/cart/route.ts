
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
    await prisma.cartItem.deleteMany({ where: { userId: user.id } })
    const productId = (item: { productId?: unknown }) => item.productId != null ? String(item.productId) : ''
    const validItems = (cartItems as { productId?: unknown; quantity?: unknown; variantId?: unknown }[]).filter(
      item => productId(item).length > 1
    )
    for (const item of validItems) {
      const pid = productId(item)
      const exists = await prisma.product.findUnique({ where: { id: pid }, select: { id: true } })
      if (!exists) continue
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: pid,
          quantity: Number(item.quantity) || 1,
          variantId: item.variantId ? String(item.variantId) : null,
        }
      })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } else {
    // Guest: not supported (handled client-side)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
