import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { passesCsrfProtection } from '@/lib/request-security'

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
      name: `${addr.firstName} ${addr.lastName}`.trim(),
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: user.email,
      phone: addr.phone ?? '',
      address: addr.address1,
      apartment: addr.address2 ?? '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.postalCode,
      country: addr.country
    }
  })
}

// POST /api/user/shipping - save default shipping address (create or update)
export async function POST(req: NextRequest) {
  if (!passesCsrfProtection(req)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

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
  // Checkout sends a single `name`; older callers send firstName/lastName.
  const nameParts = typeof body.name === 'string' ? body.name.trim().split(/\s+/) : []
  const firstName = (body.firstName?.trim() || nameParts.shift() || '') as string
  const lastName = (body.lastName?.trim() || nameParts.join(' ')) as string
  const address = body.address?.trim()
  const address2 = (body.apartment ?? body.address2)?.trim() || null
  const city = body.city?.trim()
  const state = body.state?.trim() || ''
  const zipCode = (body.zipCode ?? body.postalCode)?.trim() || ''
  const country = body.country?.trim()
  const phone = body.phone?.trim() || null

  if (!firstName || !address || !city || !country) {
    return NextResponse.json(
      { error: 'Missing required fields: name, address, city, country' },
      { status: 400 }
    )
  }

  // Unset default on all user addresses
  await prisma.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false }
  })

  // Orders keep their shipping address as an Address row too — only ever edit a saved
  // address that no order points at, so past orders' addresses never change.
  const savedAddress = await prisma.address.findFirst({
    where: { userId: user.id, orders: { none: {} } },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
  })

  const data = {
    firstName,
    lastName,
    address1: address,
    address2,
    city,
    state,
    postalCode: zipCode,
    country,
    phone,
    isDefault: true
  }

  if (savedAddress) {
    await prisma.address.update({ where: { id: savedAddress.id }, data })
  } else {
    await prisma.address.create({ data: { ...data, userId: user.id } })
  }

  return NextResponse.json({ success: true })
}
