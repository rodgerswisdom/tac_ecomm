import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products?ids=1,2,3 - fetch products by ids
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const ids = url.searchParams.get('ids')?.split(',') || []
  if (!ids.length) return NextResponse.json({ products: [] })
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: true, artisan: true, category: true }
  })
  return NextResponse.json({ products })
}
