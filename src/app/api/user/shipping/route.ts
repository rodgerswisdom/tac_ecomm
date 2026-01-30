import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/shipping - get saved default shipping address for logged-in user
export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ shipping: null })
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      addresses: {
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        take: 1
      }
    }
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
      phone: addr.phone ?? '',
      address: addr.address1,
      city: addr.city,
      state: addr.state,
      zipCode: addr.postalCode,
      country: addr.country
    }
  })
}

// POST /api/user/shipping - save default shipping address (create or update)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()
  const firstName = body.firstName?.trim()
  const lastName = body.lastName?.trim()
  const address = body.address?.trim()
  const city = body.city?.trim()
  const state = body.state?.trim()
  const zipCode = body.zipCode?.trim()
  const country = body.country?.trim()
  const phone = body.phone?.trim() || null

  if (!firstName || !lastName || !address || !city || !state || !zipCode || !country) {
    return NextResponse.json(
      { error: 'Missing required fields: firstName, lastName, address, city, state, zipCode, country' },
      { status: 400 }
    )
  }

  // Unset default on all user addresses
  await prisma.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false }
  })

  const defaultAddress = await prisma.address.findFirst({
    where: { userId: user.id }
  })

  if (defaultAddress) {
    await prisma.address.update({
      where: { id: defaultAddress.id },
      data: {
        firstName,
        lastName,
        address1: address,
        city,
        state,
        postalCode: zipCode,
        country,
        phone,
        isDefault: true
      }
    })
  } else {
    await prisma.address.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        address1: address,
        city,
        state,
        postalCode: zipCode,
        country,
        phone,
        isDefault: true
      }
    })
  }

  return NextResponse.json({ success: true })
}
