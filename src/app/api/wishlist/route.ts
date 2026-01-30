import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/wishlist - get wishlist for logged-in user
export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })
  if (!user) return NextResponse.json({ wishlist: [] })
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id }
  })
  return NextResponse.json({ wishlist })
}

// POST /api/wishlist - add product to wishlist
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const exists = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: user.id, productId } } })
  if (exists) return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 })
  const wishlist = await prisma.wishlist.create({ data: { userId: user.id, productId } })
  return NextResponse.json({ wishlist })
}

// DELETE /api/wishlist - remove product from wishlist
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  await prisma.wishlist.deleteMany({ where: { userId: user.id, productId } })
  return NextResponse.json({ success: true })
}
