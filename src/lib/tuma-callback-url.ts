/**
 * Public base URL Tuma can reach for STK push callbacks.
 * Use TUMA_CALLBACK_PUBLIC_URL (e.g. ngrok) when APP_URL is localhost.
 */
export function getTumaCallbackPublicOrigin(): string {
  const explicit = process.env.TUMA_CALLBACK_PUBLIC_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const appUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || '').trim()
  if (appUrl) {
    return appUrl.replace(/\/$/, '')
  }

  return ''
}

export function buildTumaPaymentCallbackUrl(orderId: string, requestOrigin?: string): string {
  const base =
    getTumaCallbackPublicOrigin() ||
    (requestOrigin ? requestOrigin.replace(/\/$/, '') : '')

  if (!base) {
    throw new Error(
      'Set APP_URL or TUMA_CALLBACK_PUBLIC_URL to a public HTTPS URL so Tuma can send payment callbacks.'
    )
  }

  const url = new URL('/api/payment/tuma/callback', base)
  url.searchParams.set('orderId', orderId)
  return url.toString()
}

export function isLocalCallbackOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  } catch {
    return false
  }
}

export function getTumaCallbackWarning(origin: string): string | null {
  if (!isLocalCallbackOrigin(origin)) return null
  if (process.env.TUMA_CALLBACK_PUBLIC_URL?.trim()) return null
  return (
    'Payments cannot complete automatically on localhost. Set TUMA_CALLBACK_PUBLIC_URL ' +
    'to your ngrok (or similar) HTTPS URL so Tuma can reach your callback endpoint.'
  )
}
