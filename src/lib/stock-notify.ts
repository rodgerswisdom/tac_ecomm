import { prisma } from "@/lib/prisma"
import { EmailService, getEmailConfig } from "@/lib/email"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeNotifyEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidNotifyEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeNotifyEmail(email))
}

function getStorefrontBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://www.tacaccessories.co.ke"
  ).replace(/\/$/, "")
}

/**
 * Sends pending back-in-stock emails when the product has stock again.
 * Safe to call repeatedly — only unsent requests are notified.
 */
export async function notifyBackInStockIfRestocked(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      stock: true,
      isActive: true,
      isDraft: true,
      isArchived: true,
    },
  })

  if (!product || product.stock <= 0 || product.isDraft || product.isArchived || !product.isActive) {
    return 0
  }

  const pending = await prisma.stockNotifyRequest.findMany({
    where: { productId, notifiedAt: null },
    select: { id: true, email: true },
    take: 500,
  })

  if (pending.length === 0) return 0

  const emailService = new EmailService(getEmailConfig())
  const productUrl = `${getStorefrontBaseUrl()}/products/${product.slug}`
  let sent = 0

  for (const request of pending) {
    const ok = await emailService.sendBackInStockEmail({
      to: request.email,
      productName: product.name,
      productUrl,
    })

    if (ok) {
      await prisma.stockNotifyRequest.update({
        where: { id: request.id },
        data: { notifiedAt: new Date() },
      })
      sent += 1
    }
  }

  return sent
}

export function scheduleBackInStockNotifications(productIds: Iterable<string>) {
  const unique = Array.from(new Set(productIds))
  for (const productId of unique) {
    void notifyBackInStockIfRestocked(productId).catch((error) => {
      console.error(`Failed to send back-in-stock emails for ${productId}:`, error)
    })
  }
}
