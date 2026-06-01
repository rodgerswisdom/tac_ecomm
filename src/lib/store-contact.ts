/** Canonical public contact details for TAC Accessories. */
export const DEFAULT_STORE_CONTACT = {
  email: 'info@tacaccessories.co.ke',
  phone: '+254704800866',
} as const

const PLACEHOLDER_EMAILS = new Set([
  'sales@tacaccessories.com',
  'support@tacaccessories.com',
  'noreply@tacaccessories.com',
])

const PLACEHOLDER_PHONE_DIGITS = new Set(['254700000000', '700000000'])

export function formatStorePhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return DEFAULT_STORE_CONTACT.phone
  if (digits.startsWith('254')) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+254${digits.slice(1)}`
  if (digits.length === 9) return `+254${digits}`
  return phone.startsWith('+') ? phone : `+${digits}`
}

export function getStoreContactDetails(settings?: {
  salesEmail?: string | null
  supportEmail?: string | null
  whatsappNumber?: string | null
}): { email: string; phone: string } {
  const sales = settings?.salesEmail?.trim() ?? ''
  const support = settings?.supportEmail?.trim() ?? ''
  let email = sales || support
  if (!email || PLACEHOLDER_EMAILS.has(email.toLowerCase())) {
    email = DEFAULT_STORE_CONTACT.email
  }

  const rawPhone = settings?.whatsappNumber?.trim() ?? ''
  const phoneDigits = rawPhone.replace(/\D/g, '')
  const phone =
    !phoneDigits || PLACEHOLDER_PHONE_DIGITS.has(phoneDigits)
      ? DEFAULT_STORE_CONTACT.phone
      : formatStorePhoneDisplay(rawPhone)

  return { email, phone }
}
