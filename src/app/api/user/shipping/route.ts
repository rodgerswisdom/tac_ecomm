import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/shipping - get saved shipping address for logged-in user
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { addresses: { orderBy: { updatedAt: 'desc' }, take: 1 } }
  })
  if (!user || !user.addresses?.length) {
    return NextResponse.json({ shipping: null })
  }
  const addr = user.addresses[0]
  return NextResponse.json({
    shipping: {
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: user.email,
      phone: addr.phone,
      address: addr.address1,
      city: addr.city,
      state: addr.state,
      zipCode: addr.postalCode,
      country: addr.country
    }
  })
}
