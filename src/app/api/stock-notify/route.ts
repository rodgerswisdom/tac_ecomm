import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { isValidNotifyEmail, normalizeNotifyEmail } from "@/lib/stock-notify"

const bodySchema = z.object({
  productId: z.string().min(1),
  email: z.string().min(3).max(254),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const email = normalizeNotifyEmail(parsed.data.email)
    if (!isValidNotifyEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: {
        id: true,
        stock: true,
        isActive: true,
        isDraft: true,
        isArchived: true,
      },
    })

    if (!product || product.isDraft || product.isArchived || !product.isActive) {
      return NextResponse.json({ error: "Product unavailable." }, { status: 404 })
    }

    if (product.stock > 0) {
      return NextResponse.json({ error: "This product is already in stock." }, { status: 400 })
    }

    await prisma.stockNotifyRequest.upsert({
      where: {
        productId_email: {
          productId: product.id,
          email,
        },
      },
      create: {
        productId: product.id,
        email,
      },
      update: {
        // Re-subscribe if previously notified and product is OOS again
        notifiedAt: null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[/api/stock-notify]", error)
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 })
  }
}
